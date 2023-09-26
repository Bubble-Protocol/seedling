import { Wallet } from '../Wallet';
import { getAccount, getNetwork, watchAccount, getWalletClient, getPublicClient, signMessage, disconnect, switchNetwork } from 'wagmi/actions';
import { EventManager } from '../utils/EventManager';

const WALLET_STATE = {
  disconnected: 'disconnected',
  connected: 'connected'
}

/**
 * Implementation of the HushBubble Wallet class that uses the Bubble Private Cloud to provide the functionality.
 * The Bubble Private Cloud provides an API to deploy contracts to the Base-Goerli testnet, and to send and call
 * contract methods.
 */
export class RainbowKitWallet extends Wallet {

  state = WALLET_STATE.disconnected;
  account;

  constructor() {
    super();
  }

  async isAvailable() {
    const acc = getAccount();
    return Promise.resolve(!!acc);
  }
  
  async isConnected() {
    const acc = getAccount();
    return Promise.resolve(acc ? acc.isConnected : false);
  }

  async connect() {
    return Promise.resolve();
  }

  async disconnect() {
    disconnect();
    return Promise.resolve();
  }

  getAccount() {
    const acc = getAccount();
    if (acc) return acc.address;
    else return undefined;
  }
  
  getChain() {
    const { chain } = getNetwork();
    if (chain) return chain.id;
    else return undefined;
  }

  async send(contractAddress, abi, method, params=[], options={}) { 
    if (this.state === WALLET_STATE.unavailable) throw {code: 'wallet-unavailable', message: 'wallet is not available'};

    const chainId = this.getChain();
    const walletClient = await getWalletClient({chainId});
    const publicClient = getPublicClient({chainId});

    const txHash = await walletClient.writeContract({
      address: contractAddress,
      abi: abi,
      functionName: method,
      args: params,
      ...options
    })

    console.trace('txHash', txHash);

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

    console.trace('receipt', receipt);

    return receipt;
  }

  async call(contractAddress, abi, method, params=[]) {
    if (this.state === WALLET_STATE.unavailable) throw {code: 'wallet-unavailable', message: 'wallet is not available'};

    const chainId = this.getChain();
    const publicClient = getPublicClient({chainId});

    return await publicClient.readContract({
      address: contractAddress,
      abi: abi,
      functionName: method,
      args: params
    })
  }

}


