import GraphClient from "./TheGraph";
import { expandRelativeLinks, extractImage, extractSummary, extractTitle, stripMetadata } from "../utils/markdown-utils";
import { keccak256 } from "viem";
import { Blockchain } from "./Blockchain";
import { AppError } from "../utils/errors";
import { GithubHost } from "./hosts/github";

export class Content {

  theGraph;
  blockchain;
  cache = {};
  hosts = [];

  constructor(graphUri, blockchainConfig, wallet) {
    this.theGraph = new GraphClient(graphUri);
    this.blockchain = new Blockchain(blockchainConfig, wallet);
    this.hosts.push(new GithubHost());
  }

  parseUsername(username) {
    if (!username) return {};
    return parseUsername(username);
  }

  async fetchArticle(id) {
    if (this.cache[id]) return Promise.resolve(this.cache[id]);
    return this.theGraph.fetchContent(id)
      .then(results => {
        if (results.length === 0) throw {code: 'content-not-found', message: 'content not found'};
        if (results.length !== 1) throw {code: 'unexpected-error', message: 'multiple records found'};
        return this._fetchContentAndAuthor(results[0]);
      })
      .then(content => {
        this.cache[id] = content;
        return content;
      })
  }

  async fetchPreview(urlStr, user) {
    const {url, relLinkUrl} = this._parseContentUrl(urlStr);
    return this._fetchContent('preview', url, relLinkUrl)
      .then(content => {
        return {
          ...content,
          url: urlStr,
          expandedUrl: url.toString(),
          author: {
            name: user.name || parseUsername(user.username).name,
            icon: user.icon
          },
          publishedAt: Date.now() / 1000,
          totalTips: 0
        }
      })
  }

  async fetchLatestContent(amount=10, skip=0) {
    return this.theGraph.fetchLatestContent(amount, skip)
      .then(results => {
        return Promise.all(results.map(content => this._fetchContentAndAuthor(content)));
      })
      .then(results => {
        results = results.filter(r => r.markdown !== undefined);
        results.forEach(r => this.cache[r.id] = r);
        return results;
      });
  }

  async fetchAuthorsContentByUsername(usernames, amount=10, skip=0) {
    const ids = usernames.map(u => keccak256(u));
    return this.theGraph.fetchAuthorsContent(ids, amount, skip)
      .then(results => {
        return Promise.all(results.map(content => this._fetchContentAndAuthor(content)));
      })
      .then(results => {
        results = results.filter(r => r.markdown !== undefined);
        results.forEach(r => this.cache[r.id] = r);
        return results;
      });
  }

  async fetchUserByUsername(username) {
    return this._fetchUserByUsername(username);
  }

  async fetchContentByUserId(userId, amount=10, skip=0) {
    console.trace('fetching content for user', userId);
    const user = await this._fetchUserById(userId);
    return this.theGraph.fetchUserContent(user.id, amount, skip)
      .then(results => {
        return Promise.all(results.map(r => this._fetchContentOnly(user, r)));
      })
      .then(results => {
        results = results.filter(r => r.markdown !== undefined);
        results.forEach(r => this.cache[r.id] = r);
        return results;
      });
  }

  async publish(urlStr, options) {
    const {host, url, relLinkUrl} = this._parseContentUrl(urlStr);
    const {username, contentPath} = host.getUsernameAndContentPath(url)
    const content = await this._fetchContent('publish', url, relLinkUrl);
    return this.blockchain.publishContent(content.contentHash, username, contentPath, options);
  }

  async unpublish(contentHash, options) {
    return this.blockchain.unpublishContent(contentHash, options);
  }

  async isUserRegistered(username) {
    return this.blockchain.userRegistry.call('isRegistered', [keccak256(username)]);
  }

  async _fetchContentAndAuthor(metadata) {
    const {url, relLinkUrl, sourceUrl} = this._parseContentUrl(metadata.url);
    const [content, author] = await Promise.all([
      this._fetchContent(metadata.id, url, relLinkUrl),
      this._fetchUserByMetadata(metadata.author)
    ]);
    const result = {...metadata, ...content};
    result.expandedUrl = url;
    result.sourceUrl = sourceUrl;
    result.author = {...result.author};
    result.author.name = author.name;
    result.author.icon = author.icon;
    result.totalTips = result.tips.length === 0 ? 0 : result.tips[0].total;
    return result;
  }

  async _fetchContentOnly(author, metadata) {
    const {url, relLinkUrl, sourceUrl} = this._parseContentUrl(metadata.url);
    const content = await this._fetchContent(metadata.id, url, relLinkUrl);
    const result = {...metadata, ...content};
    result.expandedUrl = url;
    result.sourceUrl = sourceUrl;
    result.author = author;
    result.totalTips = result.tips.length === 0 ? 0 : result.tips[0].total;
    return result;
  }

  async _fetchContent(id, url, relativeLinkUrl) {
    return this._fetch(url)
      .then(content => {
        const contentHash = keccak256(content);
        content = expandRelativeLinks(content, relativeLinkUrl.href);
        return {
          title: extractTitle(content, url.pathname), 
          description: extractSummary(content), 
          image: extractImage(content, url.href),
          contentHash,
          markdown: stripMetadata(content)
        };
      })
      .catch (() => {
        console.warn('Failed to fetch content with id', id);
        return {title: undefined, description: undefined, image: undefined, markdown: undefined};
      })
  }

  async _fetchUserByUsername(username) {
    return this._fetchUserById(keccak256(username));
  }

  async _fetchUserById(id) {
    if (this.cache[id]) return this.cache[id];
    console.trace('fetching user with id', id);
    const results = await this.theGraph.fetchUser(id);
    if (results.length === 0) throw new AppError('user not found', {code: 'not-a-user'});
    if (results.length > 1) console.warn('more than one user found with id', id, results);
    return this._fetchUserByMetadata({...results[0]});
  }

  async _fetchUserByMetadata(metadata) {
    const user = {...metadata, ...parseUsername(metadata.username)};
    if (this.cache[user.id]) return this.cache[user.id];
    const host = this._getHost(metadata.username);
    const {iconUrl} = await host.getUserMetadata(metadata.username, this._fetch.bind(this));
    return this._fetch(iconUrl, 'blob')
      .then(URL.createObjectURL)
      .then(icon => user.icon = icon)
      .catch(console.warn)
      .then(() => {
        this.cache[user.id] = user;
        return user;
      });
  }

  _parseContentUrl(urlStr) {
    const host = this._getHost(urlStr);
    return {host, ...host.parseContentUrl(urlStr)};
  }

  _getHost(urlStr) {
    const host = this.hosts.find(h => h.isHostStr(urlStr));
    if (!host) throw new Error('Unsupported url host');
    return host;
  }

  async _fetch(url, asType='text') {
    if (!url.href) url = new URL(url);
    if (this.cache[url.href]) {
      // console.trace('Fetching from cache:', url);
      return this.cache[url.href];
    }

    console.trace('Fetching:', url.href);
    this.cache[url.href] = fetch(url)
      .then(response => {
        if (!response.ok) {
          console.warn('Failed to fetch', url.href, ':', response);
          throw new Error(`Network response was not ok ${response.statusText}`);
        }
        return asType === 'blob' ? response.blob() : response.text();
      });
    return this.cache[url.href];
  }

  _filenameToTitle(filename) {
    filename = filename.replace(/\..+$/, '');
    filename = filename.replace(/([a-z])([A-Z])/g, '$1 $2');
    filename = filename.replace(/[_-]/g, ' ');
    const title = filename
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    return title;
  }

}


function parseUsername(username) {
  let name = username;
  if (name.startsWith('github:')) name = name.slice(7);
  name = name.replace('-', ' ');
  const result = {
    username,
    name
  }
  const parts = username.split(':');
  if (parts.length > 1) {
    result.platform = parts[0];
    result.accountName = parts.slice(1).join(':');
  }
  return result;
}

