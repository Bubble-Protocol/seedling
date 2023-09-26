import GraphClient from "./TheGraph";
import { expandRelativeLinks, extractImage, extractSummary, extractTitle } from "../utils/markdown-utils";

export class Content {

  theGraph;
  cache = [];

  constructor(graphUri) {
    this.theGraph = new GraphClient(graphUri);
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

  async latestContent(amount=10, skip=0) {
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

  async _fetchContentAndAuthor(metadata) {
    const result = {...metadata};
    const {url, relLinkUrl} = this.parseContentUrl(result.url);
    result.expandedUrl = url;
    const [content, author] = await Promise.all([
      this._fetchContent(result.id, url, relLinkUrl),
      this._fetchUser(result.author.username)
    ]);
    result.markdown = content.markdown;
    result.title = content.title;
    result.description = content.description;
    result.image = content.image;
    result.author = {...result.author};
    result.author.name = author.name;
    result.author.icon = author.icon;
    result.totalTips = result.tips.length === 0 ? 0 : result.tips[result.tips.length-1].total;
    return result;
  }

  async _fetchContent(id, url, relativeLinkUrl) {
    return this._fetch(url)
      .then(content => {
        content = expandRelativeLinks(content, relativeLinkUrl.href);
        return {
          title: extractTitle(content, url.pathname), 
          description: extractSummary(content), 
          image: extractImage(content, url.href), 
          markdown: content
        };
      })
      .catch (() => {
        console.warn('Failed to fetch content with id', id);
        return {title: undefined, description: undefined, image: undefined, markdown: undefined};
      })
  }

  async _fetchUser(username) {
    const name = this.getUserName(username);
    const iconUrl = this.getUserIconUrl(username);
    return this._fetch(iconUrl)
      .then(icon => {
        return {name: name, icon: icon};
      })
      .catch (() => {
        return {name: name, icon: undefined};
      })
  }

  parseContentUrl(urlStr) {
    let url = new URL(urlStr);
    if (urlStr.startsWith('github:')) url = new URL(url.pathname, 'https://raw.githubusercontent.com/');
    let relLinkUrl = new URL(url.href.slice(0, url.href.lastIndexOf('/')));
    return {url, relLinkUrl};
  }

  getUserIconUrl(username) {
    let url = new URL(username);
    if (username.startsWith('github:')) url = new URL(url.pathname+'.png', 'https://github.com/');
    return url;
  }

  getUserName(username) {
    let name = username;
    if (name.startsWith('github:')) name = name.slice(7);
    name = name.replace('-', ' ');
    return name;
  }

  async _fetch(url) {
    if (this.cache[url]) {
      console.trace('Fetching from cache:', url);
      return this.cache[url];
    }

    console.trace('Fetching:', url);
    const response = await fetch(url);
    if (!response.ok) {
      console.warn('Failed to fetch', url.href, ':', response);
      throw new Error(`Network response was not ok ${response.statusText}`);
    }
    const data = await response.text();
    // Cache the fetched data
    this.cache[url] = data;
    return data;

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

