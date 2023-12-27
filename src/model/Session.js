import { DEFAULT_CONFIG } from "./config";
import { FollowManager } from "./follow/FollowManager";
import localStorage from "./utils/LocalStorage";

export class Session {

  username;
  isOrg;
  tempState = {};

  constructor(chain, account) {
    this.id = chain + '-' + account;
    this.account = account;
    this._loadState();
    this.following = new FollowManager(account);
  }

  hasAccount() {
    return this.username !== undefined;
  }

  async connectToGithub(type) {
    if (this.username) return Promise.reject(new Error('already connected'));
    console.trace('connecting to GitHub as', this.account, type);
    this.tempState.activeOauthConnect = 'github';
    this._saveState();
    const config = DEFAULT_CONFIG.oauth.github;
    const state = encodeURIComponent(JSON.stringify({ type, account: this.account }));
    const scope = type === 'user-reg' ? '' : '&scope=read:org';
    window.location.href = `${config.uri}?client_id=${config.clientId}&redirect_uri=${config.redirectUri}&state=${state}${scope}`;
  }

  async deployOrg(orgManager, account, username) {
    console.trace('deploying org', username);
    if (account !== this.account) throw new Error('Login session mismatch. Did you change wallet accounts?')
    const {address, fee} = this.tempState.deployOrg || await orgManager.deployOrg();
    console.log('Org', this.tempState.deployOrg ? 'previously' : 'successfully', 'deployed at address', address, 'with fee', fee, '(wei)');
    this.isOrg = true;
    this.tempState.activeOauthConnect = 'github';
    this.tempState.deployOrg = {address, fee};
    this._saveState();
    const config = DEFAULT_CONFIG.oauth.github;
    const state = { 
      type: 'org-reg', 
      account: account, 
      org: {username, address},
      fee: '0x'+fee.toString(16)
    };
    const stateData = encodeURIComponent(JSON.stringify(state));
    window.location.href = `${config.uri}?client_id=${config.clientId}&redirect_uri=${config.redirectUri}&state=${stateData}&scope=read:org`;
  }

  setUsername(username, type) {
    if (!username) throw new Error('invalid username');
    if (type !== 'user' && type !== 'org') throw new Error('invalid type');
    if (!this.tempState.activeOauthConnect) throw new Error('setting of username denied: not user initiated');
    if (this.username) throw new Error('setting of username denied: username already set');
    console.log('Account', this.account, 'successfully set up as type', type, 'with username', username);
    this.tempState.activeOauthConnect = undefined;
    this.tempState.deployOrg = undefined;
    this.username = username;
    this.isOrg = this.isOrg || type === 'org';
    this._saveState();
  }

  _loadState() {
    console.trace('loading session state', this.id);
    const json = localStorage.read(this.id);
    if (json) {
      const state = JSON.parse(json);
      this.username = state.username;
      this.isOrg = state.isOrg || false;
      this.tempState = state.tempState;
    }
  }

  _saveState() {
    console.trace('saving session state', this.id);
    const state = {
      username: this.username,
      isOrg: this.isOrg,
      tempState: this.tempState
    }
    localStorage.write(this.id, JSON.stringify(state));
  }

}
