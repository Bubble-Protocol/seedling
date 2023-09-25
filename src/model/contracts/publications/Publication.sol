// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "../IPublication.sol";
import "./PublicationRegistry.sol";

contract Publication is IPublication {

  PublicationRegistry public publicationRegistry;
  string public name;
  bytes32 public publisher;

  constructor(PublicationRegistry _registry, string memory _name) {
    publicationRegistry = _registry;
    name = _name;
    publisher = msg.sender;
  }

  function addContent(bytes32 _contentHash) public {
    publicationRegistry.addContent(_contentHash);
  }

  function removeContent(bytes32 _contentHash) public {
    publicationRegistry.removeContent(_contentHash);
  }

}
