import GraphClient from "./TheGraph";
import anonymousUserIcon from "../../assets/img/user.png";
import { extractImage, extractSummary, extractTitle } from "../utils/markdown-utils";

export class Content {

  theGraph;
  cache = [];

  constructor(graphUri) {
    this.theGraph = new GraphClient(graphUri);
  }

  async latestContent(amount=10, skip=0) {
    return this.theGraph.fetchContent(amount, skip)
      .then(results => {
        return Promise.all(results.map(content => this._fetchContentAndAuthor(content)));
      })
      .then(results => results.filter(r => r.markdown !== undefined));
  }

  async _fetchContentAndAuthor(metadata) {
    const result = {...metadata};
    result.expandedUrl = this.parseContentUrl(result.url).href;
    const [content, author] = await Promise.all([
      this._fetchContent(result.id, result.expandedUrl),
      this._fetchUser(result.author.username)
    ]);
    result.markdown = content.markdown;
    result.title = content.title;
    result.description = content.description;
    result.image = content.image;
    result.author = {...result.author};
    result.author.name = author.name;
    result.author.icon = author.icon;
    return result;
  }

  async _fetchContent(id, urlStr) {
    const url = this.parseContentUrl(urlStr);
    return this._fetch(url)
      .then(content => {
        return {
          title: extractTitle(content, url.pathname), 
          description: extractSummary(content), 
          image: extractImage(content, urlStr), 
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
    return url;
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

