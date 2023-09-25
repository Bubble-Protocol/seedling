import GraphClient from "./TheGraph";
import anonymousUserIcon from "../../assets/img/user.png";

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
      .then(results => results.filter(r => typeof r !== 'Error'));
  }

  async _fetchContentAndAuthor(metadata) {
    const result = {...metadata};
    result.expandedUrl = this.parseContentUrl(result.url).href;
    const [content, author] = await Promise.all([
      this._fetchContent(result.expandedUrl),
      this._fetchUser(result.author.username)
    ]);
    result.content = content;
    result.author.name = author.name;
    result.author.icon = author.icon;
    return result;
  }

  async _fetchContent(urlStr) {
    const url = this.parseContentUrl(urlStr);

    if (this.cache[url]) {
      console.trace('Fetching from cache:', url);
      return this.cache[url];
    }

    try {
      console.trace('Fetching:', url);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Network response was not ok ${response.statusText}`);
      }
      const data = await response.text();
      // Cache the fetched data
      this.cache[url] = data;
      return data;
    } catch (error) {
      throw error;  // Re-throwing the error to be handled by the calling function
    }

  }

  async _fetchUser(username) {
    const name = this.getUserName(username);
    const iconUrl = this.getUserIconUrl(username);
    
    if (this.cache[iconUrl]) {
      console.trace('Fetching from cache:', iconUrl);
      return {name: name, icon: this.cache[iconUrl]};
    }

    try {
      console.trace('Fetching:', iconUrl);
      const response = await fetch(iconUrl);
      if (!response.ok) {
        throw new Error(`Network response was not ok ${response.statusText}`);
      }
      const data = await response.text();
      // Cache the fetched data
      this.cache[iconUrl] = data;
      return {name: name, icon: data};
    } catch (error) {
      return {name: name, icon: anonymousUserIcon};
    }

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

}