import { parseGwei } from "viem";
import * as simpleOrganisation from "../../contracts/orgs/SimpleOrganisation.json"

export class OrgManager {

  wallet;
  userRegistry;
  fees;
  exchangeRate;

  constructor({wallet, userRegistryAddress, fees}) {
    this.wallet = wallet;
    this.userRegistry = userRegistryAddress;
    this.fees = fees;
  }

  initialise(exchangeRate) {
    this.exchangeRate = exchangeRate;
  }

  async deployOrg() {
    const feeGwei = this.fees.deployOrg * this.exchangeRate;
    const fee = parseGwei(feeGwei.toString());
    console.trace('deploying org with fee', fee, this.fees.deployOrg, this.exchangeRate)
    return this.wallet.deploy(simpleOrganisation, [this.userRegistry, fee], {value: fee})
      .then(address => { return {address, fee} });
  }

}