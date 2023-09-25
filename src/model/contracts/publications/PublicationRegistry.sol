// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./IUserRegistry.sol";
import "./ContentRegistry.sol";
import "./IPublication.sol";

contract PublicationRegistry {

  event PublicationRegistered (
    address publication,
    string name,
    address publisher,
    uint time
  );

  event PublicationDeregistered (
    address publication,
    uint time
  );

  event ContentAdded (
    bytes32 contentHash,
    address publication,
    uint time
  );

  event ContentRemoved (
    bytes32 contentHash,
    address publication,
    uint time
  );

  IUserRegistry public userRegistry;
  ContentRegistry public contentRegistry;
  mapping (address => bool) public publications;

  constructor (IUserRegistry _userRegistry, ContentRegistry _contentRegistry) {
    userRegistry = _userRegistry;
    contentRegistry = _contentRegistry;
  }

  function register() external {
    IPublication pub = IPublication(msg.sender);
    address publisher = pub.publisher();
    string memory name = pub.name();
    require(userRegistry.isRegistered(publisher), 'publisher not registered');
    require(bytes(name).length > 0, 'publication name cannot be empty');
    publications[msg.sender] = true;
    emit PublicationRegistered(msg.sender, name, publisher, block.timestamp);
  }

  function deregister() external {
    require(publications[msg.sender], 'not registered');
    delete publications[msg.sender];
    emit PublicationDeregistered(msg.sender, block.timestamp);
  }

  function addContent(bytes32 _contentHash) external {
    require(publications[msg.sender], 'publication not registered');
    require(contentRegistry.isRegistered(_contentHash), 'content not registered');
    emit ContentAdded(_contentHash, msg.sender, block.timestamp);
  }

  function removeContent(bytes32 _contentHash) external {
    require(publications[msg.sender], 'publication not registered');
    emit ContentRemoved(_contentHash, msg.sender, block.timestamp);
  }

  function isRegistered(address _publication) external view returns (bool) {
    return publications[_publication];
  }

}
