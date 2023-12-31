import { getAccount, getNetwork, watchAccount, getWalletClient, getPublicClient, disconnect, switchNetwork } from 'wagmi/actions';
import { EventManager } from '../utils/EventManager';
import * as assert from '../utils/assertions';
import { AppError } from '../utils/errors';

const WALLET_STATE = {
  disconnected: 'disconnected',
  connected: 'connected'
}

export class RainbowKitWallet {

  state = WALLET_STATE.disconnected;
  account;
  closeWatchers = [];
  listeners = new EventManager(['connected', 'disconnected', 'account-changed']);

  constructor() {
    this.closeWatchers.push(watchAccount(this._handleAccountsChanged.bind(this)));
    this.on = this.listeners.on.bind(this.listeners);
    this.off = this.listeners.off.bind(this.listeners);
  }

  async isAvailable() {
    const acc = getAccount();
    return Promise.resolve(!!acc);
  }
  
  async isConnected() {
    const acc = getAccount();
    return Promise.resolve(assert.isObject(acc) ? acc.isConnected : false);
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

  async deploy(sourceCode, params=[], options={}) {
    if (this.state !== WALLET_STATE.connected) throw {code: 'wallet-unavailable', message: 'wallet is not available'};

    const chainId = this.getChain();
    const walletClient = await getWalletClient({chainId});
    const publicClient = getPublicClient({chainId});

    const txHash = await walletClient.deployContract({
      account: this.account,
      abi: sourceCode.abi,
      bytecode: sourceCode.bytecode || sourceCode.bin,
      args: params,
      ...options
    });

    console.trace('txHash', txHash);

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

    console.trace('receipt', receipt);

    return receipt.contractAddress;
  }

  async send(contractAddress, abi, method, params=[], options={}) { 
    if (this.state != WALLET_STATE.connected) throw {code: 'wallet-unavailable', message: 'wallet is not available'};

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
    if (this.state !== WALLET_STATE.connected) throw {code: 'wallet-unavailable', message: 'wallet is not available'};

    const chainId = this.getChain();
    const publicClient = getPublicClient({chainId});

    return publicClient.readContract({
      address: contractAddress,
      abi: abi,
      functionName: method,
      args: params
    })
    .catch(parseRevertError);
  }

  async estimateGas(contractAddress, abi, method, params=[]) {
    if (this.state !== WALLET_STATE.connected) throw {code: 'wallet-unavailable', message: 'wallet is not available'};

    const chainId = this.getChain();
    const publicClient = getPublicClient({chainId});

    return publicClient.estimateContractGas({
      account: this.getAccount(),
      address: contractAddress,
      abi: abi,
      functionName: method,
      args: params
    })
    .catch(parseRevertError);
  }

  async switchChain(chainId, chainName) {
    if (assert.isString(chainId)) chainId = parseInt(chainId);
    try {
      const chain = await switchNetwork({chainId});
    } catch (error) {
      if (error.code === 4902) {
        throw {code: 'chain-missing', message: 'Add the chain to Metamask and try again', chain: {id: parseInt(chainId), name: chainName}};
      }
      else console.warn('switchChain error:', error);
      throw error;
    }
  }

  _handleAccountsChanged(acc) {
    if (acc && acc.address) {
      this.account = acc.address;
      console.trace('wallet account:', this.account);
      const newConnection = this.state === WALLET_STATE.disconnected;
      this.state = WALLET_STATE.connected;
      if (newConnection) this.listeners.notifyListeners('connected', this.account);
      else this.listeners.notifyListeners('account-changed', this.account);
    }
    else {
      this.account = undefined;
      console.trace('wallet disconnected');
      this.state = WALLET_STATE.disconnected;
      this.listeners.notifyListeners('disconnected', this.account);
    }
  }

}


function parseRevertError(error) {
  if (!error || !error.message) throw error;
  const match = error.message.match(/reverted with the following reason:\s*(.*)\s/);
  if (match && match[1]) {
    const code =
      match[1] === 'user not registered or incorrect username' ? 'user-error' :
      match[1] === 'hash is zero' ? 'internal-error' :
      match[1] === 'content already published' ? 'already-published' :
      match[1] === 'content path already published' ? 'already-published' :
      'contract-reverted';
    console.warn(error);
    throw new AppError(match[1], {code: code, cause: error.message});
  }
  throw error;
}