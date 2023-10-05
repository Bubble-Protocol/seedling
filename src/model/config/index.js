import * as tipJarAbi from "../../contracts/the-graph/abis/TipJar.json";
import * as contentRegistryAbi from "../../contracts/the-graph/abis/ContentRegistry.json";
import * as userRegistryAbi from "../../contracts/the-graph/abis/UserRegistry.json";

export const DEFAULT_CONFIG = {
  graphUri: "https://api.studio.thegraph.com/query/53709/seedling/v0.1.0",
  userRegistry: {
    contract: {
      address: "0x04C2973Ab533B1eBe60ba608C026B37799BC5983",
      abi: userRegistryAbi.default
    }
  },
  contentRegistry: {
    contract: {
      address: "0x038ADdfd80f722E4826A467690Ab50EEbE1cfFb7",
      abi: contentRegistryAbi.default
    }
  },
  tipJar: {
    contract: {
      address: "0x778629c02e8Fe1Eb10e2149e017a20D519e55D6e",
      abi: tipJarAbi.default
    },
    exchangeRateLookupServices: [
      async () => { return fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD").then(response => response.json()).then(data => data["USD"])},
      async () => { return fetch("https://api.coinbase.com/v2/exchange-rates?currency=ETH").then(response => response.json()).then(data => parseFloat(data["data"]["rates"]["USD"])) }
    ]
  },
  oauth: {
    github: {
      uri: "https://github.com/login/oauth/authorize",
      clientId: "71b2165c311205b56efb",
      redirectUri: "https://vault.bubbleprotocol.com/github-callback",
    }
  }
}