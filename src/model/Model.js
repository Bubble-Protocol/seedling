import { DEFAULT_CONFIG } from "./config";
import { Content } from "./content/Content";
import { stateManager } from "../state-context";
import { RainbowKitWallet } from "./wallets/RainbowKitWallet";

export class Model {

  contentManager;
  wallet;

  constructor() {
    this.wallet = new RainbowKitWallet();
    this.contentManager = new Content(DEFAULT_CONFIG.graphUri);
    stateManager.register('latest-content', []);
    stateManager.register('query-functions', {
      getArticleById: this.contentManager.fetchArticle.bind(this.contentManager)
    });
  }

  async initialise() {
    const latestContent = await this.contentManager.latestContent();
    console.trace('latestContent', latestContent);
    stateManager.dispatch('latest-content', latestContent);
  }

}