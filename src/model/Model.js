import { DEFAULT_CONFIG } from "./config";
import { Content } from "./content/Content";
import { stateManager } from "../state-context";
import { RainbowKitWallet } from "./wallets/RainbowKitWallet";
import { TipManager } from "./tips/TipManager";
import { Session } from "./Session";
import { OrgManager } from "./content/OrgManager";

export class Model {

  contentManager;
  tipManager;
  wallet;

  constructor() {
    this.wallet = new RainbowKitWallet();
    this.wallet.on('connected', this._handleAccountChanged.bind(this));
    this.wallet.on('disconnected', this._handleAccountChanged.bind(this));
    this.wallet.on('account-changed', this._handleAccountChanged.bind(this));
    this.contentManager = new Content(DEFAULT_CONFIG.graphUri, DEFAULT_CONFIG, this.wallet);
    this.tipManager = new TipManager(DEFAULT_CONFIG.tipJar, this.wallet);
    this.orgManager = new OrgManager({
      wallet: this.wallet, 
      userRegistryAddress: DEFAULT_CONFIG.userRegistry.contract.address, 
      fees: DEFAULT_CONFIG.fees.orgManager, 
      exchangeRate: this.tipManager.dollarExchangeRate
    });
    stateManager.register('wallet-connected', false);
    stateManager.register('user', {h:'h'});
    stateManager.register('account-functions', {
      connectToGithub: (type) => this.session && this.session.connectToGithub(type),
      disconnect: this.wallet.disconnect.bind(this.wallet),
      setUsername: this.setUsername.bind(this),
      deployOrganisation: (...params) => this.session && this.session.deployOrg(this.orgManager, ...params)
    });
    stateManager.register('content-functions', {
      getArticleById: this.contentManager.fetchArticle.bind(this.contentManager),
      getPreview: this.getPreview.bind(this),
      publish: this.publish.bind(this),
      unpublish: this.unpublish.bind(this),
      getUser: this.contentManager.fetchUserByUsername.bind(this.contentManager),
      getUserContent: this.contentManager.fetchContentByUserId.bind(this.contentManager),
      getLatestContent: this.contentManager.fetchLatestContent.bind(this.contentManager),
      getFollowingContent: this.contentManager.fetchAuthorsContentByUsername.bind(this.contentManager),
      isUserRegistered: this.contentManager.isUserRegistered.bind(this.contentManager)
    });
    stateManager.register('tip-functions', {
      tip: this.tipManager.tip.bind(this.tipManager),
      tipDollars: this.tipManager.tipDollars.bind(this.tipManager),
      canTipInDollars: this.tipManager.canTipInDollars.bind(this.tipManager)
    });
    stateManager.register('exchange-rate');
  }

  async initialise() {
    this.tipManager.initialise()
      .then(() => {
        stateManager.dispatch('exchange-rate', this.tipManager.dollarExchangeRate);
        this.orgManager.initialise(this.tipManager.dollarExchangeRate);
      });
  }

  setUsername(account, username, type) {
    if (!this.session) throw new Error('wallet not connected');
    if (account !== this.session.account) throw new Error('incorrect account');
    this.session.setUsername(username, type);
    stateManager.dispatch('user', {account, username: this.session.username, isOrg: this.session.isOrg});
  }

  async getPreview(urlStr) {
    const user = this.session ? {username: this.session.username} : {username: 'Barney Rubble'}
    return this.contentManager.fetchPreview(urlStr, user)
  }

  async publish(urlStr) {
    if (!this.session) throw new Error('wallet not connected');
    return this.contentManager.publish(urlStr, {isOrg: this.session.isOrg})
  }

  async unpublish(contentId) {
    if (!this.session) throw new Error('wallet not connected');
    return this.contentManager.unpublish(contentId, {isOrg: this.session.isOrg})
  }

  _handleAccountChanged(account) {
    console.trace('wallet account changed to', account);
    this.session = undefined;
    if (account) {
      this.session = new Session(DEFAULT_CONFIG.chain, account);
      const user = {
        account, 
        ...this.contentManager.parseUsername(this.session.username),
        isOrg: this.session.isOrg,
        followingFunctions: {
          follow: this.session.following.follow,
          unfollow: this.session.following.unfollow,
          isFollowing: this.session.following.isFollowing,
          followers: this.session.following.followers
        }
      };
      console.trace('user set to', this.session.username, user)
      stateManager.dispatch('user', user);
      stateManager.dispatch('wallet-connected', true);
    }
    else {
      stateManager.dispatch('user', {account});
      stateManager.dispatch('wallet-connected', false);
    }
  }

}