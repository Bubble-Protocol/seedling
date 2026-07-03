import * as tipJarAbi from "../../contracts/the-graph/abis/TipJar.json";
import * as contentRegistryAbi from "../../contracts/the-graph/abis/ContentRegistry.json";
import * as userRegistryAbi from "../../contracts/the-graph/abis/UserRegistry-modified.json";

export const DEFAULT_CONFIG = {
  chain: "polygon",
  graphUri: "https://gateway.thegraph.com/api/subgraphs/id/6Qng8q4uRPvHoeDwzvzVxPE7FdwhaJ4PPtWbT71Yjw7F",
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
      async () => { return fetch("https://api.coinbase.com/v2/exchange-rates?currency=POL").then(response => response.json()).then(data => parseFloat(data["data"]["rates"]["USD"])).catch(error => exchangeRateCatchFn(error, 'Coinbase')) },
      async () => { return fetch("https://api.binance.com/api/v3/ticker/price?symbol=POLUSDT").then(response => response.json()).then(data => parseFloat(data["price"])).catch(error => exchangeRateCatchFn(error, 'Binance')) },
      async () => { return fetch("https://api.gateio.ws/api/v4/spot/tickers?currency_pair=POL_USDT").then(response => response.json()).then(data => parseFloat(data[0]["last"])).catch(error => exchangeRateCatchFn(error, 'Gate.io')) },
      async () => { return fetch("https://api.bybit.com/v5/market/tickers?category=spot&symbol=POLUSDT").then(response => response.json()).then(data => parseFloat(data["result"]["list"][0]["lastPrice"])).catch(error => exchangeRateCatchFn(error, 'Bybit')) },
      async () => { return fetch("https://api.diadata.org/v1/assetQuotation/Ethereum/0x455e53CBB86018Ac2B8092FdCd39d8444aFFC3F6").then(response => response.json()).then(data => parseFloat(data["Price"])).catch(error => exchangeRateCatchFn(error, 'Diadata')) }
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
      deployOrg: 20
    }
  }
}

const exchangeRateCatchFn = (error, serviceName) => {
  console.warn(`Error fetching exchange rate from ${serviceName}:`, error);
  return undefined;
};