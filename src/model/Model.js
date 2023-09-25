import { DEFAULT_CONFIG } from "./config";
import { Content } from "./content/Content";

export class Model {

  contentManager;

  constructor() {
    this.contentManager = new Content(DEFAULT_CONFIG.graphUri);
  }

  async initialise() {
    const latestContent = await this.contentManager.latestContent();
    console.trace('latestContent', latestContent);
  }

}