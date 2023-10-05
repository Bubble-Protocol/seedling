import * as simpleOrganisation from "../../contracts/orgs/SimpleOrganisation.json"

export class OrgManager {

  wallet;
  userRegistry;

  constructor(wallet, userRegistryAddress) {
    this.wallet = wallet;
    this.userRegistry = userRegistryAddress;
  }

  async deployOrg() {
    return this.wallet.deploy(simpleOrganisation, [this.userRegistry]);
  }

}