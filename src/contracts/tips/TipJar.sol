/**
 * Tip Jar
 *
 * Allows content to be tipped and records the total amount tipped for each piece of content.
 * The Tip Jar is an upgradeable smart contract.
 */

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "../content/ContentRegistry.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/Proxy.sol";
import "../EternalStorage.sol";


/**
 * The registry data definition. Non-upgradeable eternal storage.
 */
abstract contract TipJarStorage is EternalStorage {

  mapping (bytes32 => uint) public tipRegistry;

  bytes32 internal _endOfStorage = END_OF_STORAGE;

}


/**
 * The tip registry storage contract. Non-upgradeable.
 */
contract TipJar is TipJarStorage, Proxy {

  constructor() {
    _initialiseStorageContract();
  }

  function _implementation() internal view override returns (address) {
    return implementationContract;
  }

}


/**
 * Upgradeable tip registry implementation. Allows users to tip registered content subtracting a
 * configurable fee. Emits a Tip event.
 */
contract TipJarImplementation is TipJarStorage {

  event Tip (
    bytes32 contentId,
    address tipper,
    uint256 amount,
    uint256 total
  );

  /**
   * Content Registry used to identify the content author when tipping
   */
  ContentRegistry public content;

  /**
   * Recipient address for all protocol fees
   */
  address payable public protocolFeeRecipient;

  /**
   * Percentage fee (percent x 10).  E.g. 1000 = 100%, 10 = 1%
   */
  uint256 public protocolFeeRate;


  function _initialise(ContentRegistry _contentRegistry, uint256 _protocolFeeRate) external onlyOwner onlyProxy {
    _verifyEternalStorage(_endOfStorage);
    require(!initialised, "already initialised");
    content = _contentRegistry;
    protocolFeeRecipient = payable(msg.sender);
    protocolFeeRate = _protocolFeeRate;
    initialised = true;
  }

  function setProtocolFeeRecipient(address payable _recipient) external onlyOwner onlyProxy {
    protocolFeeRecipient = _recipient;
  }

  function setProtocolFeeRate(uint256 _protocolFeeRate) external onlyOwner onlyProxy {
    require(_protocolFeeRate <= 1000, "invalid rate");
    protocolFeeRate = _protocolFeeRate; 
  }

  function tip(bytes32 _contentHash) external payable onlyProxy {
    require(content.isRegistered(_contentHash), "content does not exist");
    address payable authorAddress = payable(content.getAuthorAddress(_contentHash));
    uint256 protocolFee = msg.value * protocolFeeRate / 1000;
    uint256 authorFee = msg.value - protocolFee;
    tipRegistry[_contentHash] += msg.value;
    protocolFeeRecipient.transfer(protocolFee);
    authorAddress.transfer(authorFee);
    emit Tip(_contentHash, msg.sender, msg.value, tipRegistry[_contentHash]);
  }

}