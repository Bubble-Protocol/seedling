export class Host {

  id;
  hostnames;

  constructor(id, hostnames = []) {
    this.id = id;
    this.hostnames = hostnames;
  }

  isHostStr(urlStr) {
    try {
      const url = new URL(urlStr);
      return url.protocol === this.id+':' || this.hostnames.includes(url.hostname);
    }
    catch (e) {
      return false;
    }
  }

  getUsernameAndContentPath(url) {
    const paths = url.pathname.split('/');
    const username = paths[1];
    const contentPath = paths.slice(2).join('/');
    return {username: this.id+':'+username, contentPath};
  }

}