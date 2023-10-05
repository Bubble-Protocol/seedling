import { DEFAULT_CONFIG } from "./config";
import { FollowManager } from "./follow/FollowManager";
import localStorage from "./utils/LocalStorage";

export class Session {

  username;
  isOrg;
  activeOauthConnect;

  constructor(id) {
    this.id = id;
    this._loadState();
    this.following = new FollowManager(id);
  }

  hasAccount() {
    return this.username !== undefined;
  }

  async connectToGithub(type) {
    if (this.username) return Promise.reject(new Error('already connected'));
    console.trace('connecting to GitHub as', this.id, type);
    this.activeOauthConnect = 'github';
    this._saveState();
    const config = DEFAULT_CONFIG.oauth.github;
    const state = encodeURIComponent(JSON.stringify({ type, account: this.id }));
    const scope = type === 'user-reg' ? '' : '&scope=read:org';
    window.location.href = `${config.uri}?client_id=${config.clientId}&redirect_uri=${config.redirectUri}&state=${state}${scope}`;
  }

  async deployOrg(orgManager, account, username) {
    console.trace('deploying org', username);
    if (account !== this.id) throw new Error('Login session mismatch. Did you change wallet accounts?')
    const orgAddress = await orgManager.deployOrg();
    console.trace('successfully deployed org at address:', orgAddress);
    this.isOrg = true;
    this.activeOauthConnect = 'github';
    this._saveState();
    const config = DEFAULT_CONFIG.oauth.github;
    const state = encodeURIComponent(JSON.stringify({ type: 'org-reg', account: account, org: {username, address: orgAddress} }));
    window.location.href = `${config.uri}?client_id=${config.clientId}&redirect_uri=${config.redirectUri}&state=${state}&scope=read:org`;
  }

  setUsername(username, type) {
    if (!username) throw new Error('invalid username');
    if (type !== 'user' && type !== 'org') throw new Error('invalid type');
    if (!this.activeOauthConnect) throw new Error('setting of username denied: not user initiated');
    if (this.username) throw new Error('setting of username denied: username already set');
    this.activeOauthConnect = undefined;
    this.username = username;
    this.isOrg = type === 'org';
    this._saveState();
  }

  _loadState() {
    const json = localStorage.read(this.id);
    if (json) {
      const state = JSON.parse(json);
      this.username = state.username;
      this.isOrg = state.isOrg || false;
      this.activeOauthConnect = state.connectingViaOauth;
    }
  }

  _saveState() {
    console.trace('saving session state');
    const state = {
      username: this.username,
      isOrg: this.isOrg,
      connectingViaOauth: this.activeOauthConnect,
    }
    localStorage.write(this.id, JSON.stringify(state));
  }

}
