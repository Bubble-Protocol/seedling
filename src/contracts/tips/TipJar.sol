// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "../content/ContentRegistry.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TipJar is Ownable {

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
   * Total amount of tips per content id
   */
  mapping (bytes32 => uint) tipRegistry;

  /**
   * Recipient address for all protocol fees
   */
  address payable public protocolFeeRecipient;

  /**
   * Percentage fee (percent x 10).  E.g. 1000 = 100%, 10 = 1%
   */
  uint256 public protocolFeeRate;


  constructor (ContentRegistry _contentRegistry, uint256 _protocolFeeRate) {
    content = _contentRegistry;
    protocolFeeRecipient = payable(msg.sender);
    protocolFeeRate = _protocolFeeRate;
  }

  function setProtocolFeeRecipient(address payable _recipient) public onlyOwner {
    protocolFeeRecipient = _recipient;
  }

  function setProtocolFeeRate(uint256 _protocolFeeRate) public onlyOwner {
    require(_protocolFeeRate <= 1000, "invalid rate");
    protocolFeeRate = _protocolFeeRate; 
  }

  function tip(bytes32 _contentHash) external payable {
    require(content.isRegistered(_contentHash), 'content does not exist');
    address payable authorAddress = payable(content.getAuthorAddress(_contentHash));
    uint256 protocolFee = msg.value * protocolFeeRate / 1000;
    uint256 authorFee = msg.value - protocolFee;
    protocolFeeRecipient.transfer(protocolFee);
    authorAddress.transfer(authorFee);
    tipRegistry[_contentHash] += msg.value;
    emit Tip(_contentHash, msg.sender, msg.value, tipRegistry[_contentHash]);
  }

}