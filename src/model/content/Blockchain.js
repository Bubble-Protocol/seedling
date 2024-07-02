
export class Blockchain {

  config;
  wallet;

  constructor(config, wallet) {
    this.wallet = wallet;
    this.config = config;
  }

  async publishContent(contentHash, username, contentPath, options={}) {
    if (contentPath.slice(0,1) === '/') contentPath = contentPath.slice(1);
    console.trace('publishing content:', contentHash, username, contentPath, options);
    const contract = this.config.contentRegistry.contract;
    const method = options.isOrg ? 'publishAsOrg' : 'publish';
    const params = [contentHash, username, contentPath];
    await this.wallet.estimateGas(contract.address, contract.abi, method, params);
    return this.wallet.send(contract.address, contract.abi, method, params);
  }

  async unpublishContent(contentHash, options={}) {
    console.trace('unpublishing content:', contentHash, options);
    const contract = this.config.contentRegistry.contract;
    const method = options.isOrg ? 'unpublishAsOrg' : 'unpublish';
    const params = [contentHash];
    await this.wallet.estimateGas(contract.address, contract.abi, method, params);
    return this.wallet.send(contract.address, contract.abi, method, params);
  }

  userRegistry = {
    call: (method, params=[]) => this.wallet.call(this.config.userRegistry.contract.address, this.config.userRegistry.contract.abi, method, params)
  }

}