// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./content/ContentRegistry.sol";
import "./publications/PublicationRegistry.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Seedling is Ownable {

  ContentRegistry public content;
  PublicationRegistry public publications;
  mapping (bytes32 => uint) tipRegistry;
  address public protocolFeeRecipient;
  uint256 public protocolFeePercent;

  constructor (ContentRegistry _contentRegistry, PublicationRegistry _publicationRegistry, uint256 _protocolFeePercent1000) {
    content = _contentRegistry;
    publications = _publicationRegistry;
    protocolFeeRecipient = msg.sender;
    protocolFeePercent = _protocolFeePercent1000;
  }

  function publishContent(bytes32 _contentHash, string memory _username, string memory _contentPath) external {
    content.publish(_contentHash, _username, _contentPath);
  }

  function unpublish(bytes32 _contentHash) external {
    content.unpublish(_contentHash);
  }

  function setProtocolFeeRecipient(address _recipient) public onlyOwner {
    protocolFeeRecipient = _recipient;
  }

  function setProtocolFeePercent(uint256 _percent1000) public onlyOwner {
    protocolFeePercent = _percent1000; 
  }

  function tip(bytes32 _contentHash) external payable {
    require(content.isRegistered(_contentHash), 'content does not exist');
    address authorAddress = content.getAuthorAddress(_contentHash);
    uint256 protocolFee = msg.value * protocolFeePercent / 1000;
    uint256 authorFee = msg.value - protocolFee;
    tipRegistry[_contentHash] += msg.value;
    (bool success1, ) = protocolFeeRecipient.call{value: protocolFee}("");
    (bool success2, ) = authorAddress.call{value: authorFee}("");
    require(success1 && success2, "Failed to send tip");
  }

}