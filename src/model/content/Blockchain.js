
export class Blockchain {

  wallet;

  constructor(config, wallet) {
    this.wallet = wallet;
    this.config = config;
  }

  async publishContent(contentHash, username, contentPath) {
    if (contentPath.slice(0,1) === '/') contentPath = contentPath.slice(1);
    console.trace('publishing content:', contentHash, username, contentPath);
    await this.wallet.estimateGas(this.config.contract.address, this.config.contract.abi, 'publish', [contentHash, username, contentPath]);
    return this.wallet.send(this.config.contract.address, this.config.contract.abi, 'publish', [contentHash, username, contentPath]);
  }

}