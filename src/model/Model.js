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
    this.contentManager = new Content(DEFAULT_CONFIG.graphUri);
    this.tipManager = new TipManager(DEFAULT_CONFIG.tipJar, this.wallet);
    stateManager.register('username');
    stateManager.register('userId');
    stateManager.register('latest-content', []);
    stateManager.register('account-functions', {
      connectToGithub: () => this.session && this.session.connectToGithub(),
      setUsername: this.setUsername.bind(this)
    });
    stateManager.register('query-functions', {
      getArticleById: this.contentManager.fetchArticle.bind(this.contentManager)
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

  setUsername(username) {
    if (!this.session) throw new Error('wallet not connected');
    this.session.setUsername(username);
    stateManager.dispatch('username', this.session.username);
  }

  _handleAccountChanged(account) {
    if (this.session) this.session.close();
    this.session = new Session(account);
    stateManager.dispatch('username', this.session.username);
    stateManager.dispatch('userId', this.session.userId);
  }

}