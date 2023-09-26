export class Tipping {

  contract;
  wallet;

  constructor(config, wallet) {
    this.contract = config;
    this.wallet = wallet;
  }

  tip(contentId, amount) {
    return this.wallet.send(this.contract.address, this.contract.abi, 'tip', [contentId], {value: amount});
  }
  
}