
export class Blockchain {

  config;
  wallet;

  constructor(config, wallet) {
    this.wallet = wallet;
    this.config = config;
  }

  async publishContent(contentHash, username, contentPath) {
    if (contentPath.slice(0,1) === '/') contentPath = contentPath.slice(1);
    console.trace('publishing content:', contentHash, username, contentPath);
    const contract = this.config.contentRegistry.contract;
    await this.wallet.estimateGas(contract.address, contract.abi, 'publish', [contentHash, username, contentPath]);
    return this.wallet.send(contract.address, contract.abi, 'publish', [contentHash, username, contentPath]);
  }

  userRegistry = {
    call: (method, params=[]) => this.wallet.call(this.config.userRegistry.contract.address, this.config.userRegistry.contract.abi, method, params)
  }

}