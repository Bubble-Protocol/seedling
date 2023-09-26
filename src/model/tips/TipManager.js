import { parseEther, parseGwei } from "viem";

export class TipManager {

  contract;
  wallet;
  config;
  dollarExchangeRate;

  constructor(config, wallet) {
    this.wallet = wallet;
    this.config = config;
  }

  async initialise() {
    try {
      console.debug(this.config)
      const rates = await Promise.all(this.config.exchangeRateLookupServices.map(service => service()));
      console.debug('rates', rates)
      if (rates.length < 2) throw new Error('Cannot rely on an exchange rate from only', rates.length, 'source(s)');
      const mean = rates.reduce((acc, rate) => acc + rate, 0) / rates.length;
      console.debug('mean', mean, Math.max(rates[0], mean), Math.min(rates[0], mean), Math.max(rates[0], mean) / Math.min(rates[0], mean))
      if (Math.max(rates[0], mean) / Math.min(rates[0], mean) > 1.01) throw new Error('Exchange rates read from lookup services do not match sufficiently to calculate a reliable exchange rate', rates);
      this.dollarExchangeRate = Number(parseEther((1.0/mean).toString(), 'gwei'));
      console.trace('dollar exchange rate set to', mean, this.dollarExchangeRate);
    }
    catch(error) {
      console.warn(error);
    }
  }

  canTipInDollars() {
    return this.dollarExchangeRate !== undefined;
  }

  tipDollars(contentId, dollars) {
    console.trace('tip', contentId, '$'+dollars);
    if (!this.dollarExchangeRate) return Promise.reject('cannot tip in dollars since exchange rate cannot be determined');
    if (isNaN(dollars)) return Promise.reject(new Error('tip dollar amount is not a number'));
    return this.tip(contentId, dollars * this.dollarExchangeRate);
  }

  tip(contentId, amount) {
    console.trace('tip', contentId, amount, this.config.contract);
    return this.wallet.send(this.config.contract.address, this.config.contract.abi, 'tip', [contentId], {value: parseGwei(amount.toString())});
  }
  
}