import { DEFAULT_CONFIG } from "./config";
import { Content } from "./content/Content";
import { stateManager } from "../state-context";
import { RainbowKitWallet } from "./wallets/RainbowKitWallet";
import { TipManager } from "./tips/TipManager";

export class Model {

  contentManager;
  tipManager;
  wallet;

  constructor() {
    this.wallet = new RainbowKitWallet();
    this.contentManager = new Content(DEFAULT_CONFIG.graphUri);
    this.tipManager = new TipManager(DEFAULT_CONFIG.tipJar, this.wallet);
    stateManager.register('latest-content', []);
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

}