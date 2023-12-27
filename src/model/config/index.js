import * as tipJarAbi from "../../contracts/the-graph/abis/TipJar.json";
import * as contentRegistryAbi from "../../contracts/the-graph/abis/ContentRegistry.json";
import * as userRegistryAbi from "../../contracts/the-graph/abis/UserRegistry.json";

export const DEFAULT_CONFIG = {
  chain: "polygon",
  graphUri: "https://api.studio.thegraph.com/query/53709/seedling/version/latest",
  userRegistry: {
    contract: {
      address: "0x5Ec6A3284049E8b3e5966882fd3D40FCFB839501",
      abi: userRegistryAbi.default
    }
  },
  contentRegistry: {
    contract: {
      address: "0xF86eFfA878F484DF4a2D2d1703AE59030F365131",
      abi: contentRegistryAbi.default
    }
  },
  tipJar: {
    contract: {
      address: "0x1c4a6b233DABf5566Ae719665755B4F8551ebAe3",
      abi: tipJarAbi.default
    },
    exchangeRateLookupServices: [
      async () => { return fetch("https://min-api.cryptocompare.com/data/price?fsym=MATIC&tsyms=USD").then(response => response.json()).then(data => data["USD"])},
      async () => { return fetch("https://api.coinbase.com/v2/exchange-rates?currency=MATIC").then(response => response.json()).then(data => parseFloat(data["data"]["rates"]["USD"])) }
    ]
  },
  oauth: {
    github: {
      uri: "https://github.com/login/oauth/authorize",
      clientId: "71b2165c311205b56efb",
      redirectUri: "https://vault.bubbleprotocol.com/github-callback",
    }
  },
  fees: {  // in dollars
    orgManager: {
      deployOrg: 0
    }
  }
}