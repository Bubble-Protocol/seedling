import { DEFAULT_CONFIG } from "./config";
import localStorage from "./utils/LocalStorage";

export class Session {

  username = undefined;
  activeOauthConnect = undefined;

  constructor(id) {
    this.id = id;
    this._loadState();
  }

  hasAccount() {
    return this.username !== undefined;
  }

  connectToGithub() {
    if (this.username) return Promise.reject(new Error('already connected'));
    const config = DEFAULT_CONFIG.oauth.github;
    this.activeOauthConnect = 'github';
    this._saveState();
    const state = encodeURIComponent(JSON.stringify({ account: this.id }));
    window.location.href = `${config.uri}?client_id=${config.clientId}&redirect_uri=${config.redirectUri}&state=${state}`;
    return Promise.resolve();
  }

  setUsername(username) {
    if (!this.activeOauthConnect) throw new Error('setting of username denied: not user initiated');
    if (this.username) throw new Error('setting of username denied: username already set');
    this.activeOauthConnect = undefined;
    this.username = username;
    this._saveState();
  }

  _loadState() {
    const json = localStorage.read(this.id);
    if (json) {
      const state = JSON.parse(json);
      this.username = state.username;
      this.activeOauthConnect = state.connectingViaOauth;
    }
  }

  _saveState() {
    console.trace('saving session state');
    const state = {
      username: this.username,
      connectingViaOauth: this.activeOauthConnect,
    }
    localStorage.write(this.id, JSON.stringify(state));
  }

}
