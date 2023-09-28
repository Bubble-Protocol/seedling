import { DEFAULT_CONFIG } from "./config";
import { Content } from "./content/Content";
import { stateManager } from "../state-context";
import { RainbowKitWallet } from "./wallets/RainbowKitWallet";
import { TipManager } from "./tips/TipManager";
import { Session } from "./Session";

export class Model {

  contentManager;
  tipManager;
  wallet;

  constructor() {
    this.wallet = new RainbowKitWallet();
    this.wallet.on('connected', this._handleAccountChanged.bind(this));
    this.contentManager = new Content(DEFAULT_CONFIG.graphUri, DEFAULT_CONFIG.contentRegistry, this.wallet);
    this.tipManager = new TipManager(DEFAULT_CONFIG.tipJar, this.wallet);
    stateManager.register('user', {});
    stateManager.register('latest-content', []);
    stateManager.register('account-functions', {
      connectToGithub: () => this.session && this.session.connectToGithub(),
      setUsername: this.setUsername.bind(this)
    });
    stateManager.register('content-functions', {
      getArticleById: this.contentManager.fetchArticle.bind(this.contentManager),
      getPreview: this.getPreview.bind(this),
      publish: this.publish.bind(this),
      getUser: this.contentManager.fetchUserByUsername.bind(this.contentManager),
      getUserContent: this.contentManager.fetchContentByUserId.bind(this.contentManager)
    });
    stateManager.register('tip-functions', {
      tip: this.tipManager.tip.bind(this.tipManager),
      tipDollars: this.tipManager.tipDollars.bind(this.tipManager),
      canTipInDollars: this.tipManager.canTipInDollars.bind(this.tipManager)
    });
  }

  async initialise() {
    this.tipManager.initialise();
    const latestContent = await this.contentManager.latestContent();
    console.trace('latestContent', latestContent);
    stateManager.dispatch('latest-content', latestContent);
  }

  setUsername(account, username) {
    if (!this.session) throw new Error('wallet not connected');
    if (account !== this.session.id) throw new Error('incorrect account');
    this.session.setUsername(username);
    stateManager.dispatch('user', {account, username: this.session.username});
  }

  async getPreview(urlStr) {
    const user = this.session ? {username: this.session.username} : {username: 'Barney Rubble'}
    return this.contentManager.fetchPreview(urlStr, user)
  }

  async publish(urlStr) {
    if (!this.session) throw new Error('wallet not connected');
    return this.contentManager.publish(urlStr, this.session.username)
  }

  _handleAccountChanged(account) {
    console.trace('wallet account changed to', account);
    if (this.session) this.session.close();
    this.session = new Session(account);
    console.debug('this.session.username', this.session.username)
    stateManager.dispatch('user', {account, username: this.session.username});
  }

}