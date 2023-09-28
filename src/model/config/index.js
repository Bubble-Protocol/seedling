import * as tipJarAbi from "../../contracts/the-graph/abis/TipJar.json";
import * as contentRegistryAbi from "../../contracts/the-graph/abis/ContentRegistry.json";

export const DEFAULT_CONFIG = {
  graphUri: "https://api.studio.thegraph.com/query/53709/seedling/v0.0.9",
  tipJar: {
    contract: {
      address: "0x855a734b38C4fBE8FA00cA5Fc0e60c5F7d6FbB2A",
      abi: tipJarAbi.default
    },
    exchangeRateLookupServices: [
      async () => { return fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD").then(response => response.json()).then(data => data["USD"])},
      async () => { return fetch("https://api.coinbase.com/v2/exchange-rates?currency=ETH").then(response => response.json()).then(data => parseFloat(data["data"]["rates"]["USD"])) }
    ]
  },
  contentRegistry: {
    contract: {
      address: "0xcA1138cC718FC42330173062dF4a9F9A4EFDfFe4",
      abi: contentRegistryAbi.default
    }
  },
  oauth: {
    github: {
      uri: "https://github.com/login/oauth/authorize",
      clientId: "71b2165c311205b56efb",
      redirectUri: "https://vault.bubbleprotocol.com/github-callback",
    }
  }
}