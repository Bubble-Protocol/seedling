import { Host } from "./Host";

export class GithubHost extends Host {

  constructor() {
    super('github', ['github.com', 'raw.githubusercontent.com']);
  }

  parseContentUrl(urlStr) {
    let url = new URL(urlStr);
    url = new URL(url.pathname, 'https://raw.githubusercontent.com/');
    const relLinkUrl = new URL(url.href.slice(0, url.href.lastIndexOf('/')));
    const sourceUrl = this._parseRawContentUrl(url.toString());
    return {url, relLinkUrl, sourceUrl};
  }

  parseUserUrl(urlStr) {
    const url = new URL(urlStr);
    const username = url.pathname;
    return {url, username, metadataUrl: "https://api.github.com/users/"+url.pathname};
  }

  async getUserMetadata(urlStr, fetchFunction) {
    const {metadataUrl} = this.parseUserUrl(urlStr);
    return fetchFunction(metadataUrl)
      .then(json => {
        const githubMetadata = JSON.parse(json);
        return {
          iconUrl: githubMetadata['avatar_url'].replace(/\?.*/, '')+'?size=48'
        }
      })
  }

  _parseRawContentUrl(urlStr) {
    const url = new URL(urlStr);
    url.hostname = 'github.com';
    const paths = url.pathname.split('/').filter(segment => segment);
    url.pathname = paths.slice(0,2).join('/') + '/blob/' + paths.slice(2).join('/');
    return url;
  }
  
}