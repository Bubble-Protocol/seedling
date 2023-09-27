// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "../IUserRegistry.sol";

contract ContentRegistry {

  event PublishedContent(
    bytes32 indexed hash,
    string url,
    bytes32 indexed author
  );

  event DeletedContent(
    bytes32 indexed hash
  );

  struct ContentMetadata {
    string url;
    bytes32 author;
  }

  IUserRegistry public userRegistry;
  mapping (bytes32 => ContentMetadata) public contentMetadata;
  mapping (bytes32 => bytes32) contentUrlRegistry;

  constructor (IUserRegistry _userRegistry) {
    userRegistry = _userRegistry;
  }

  function publish(bytes32 _contentHash, string memory _username, string memory _contentPath) external {
    bytes32 authorId = keccak256(bytes(_username));
    string memory url = string.concat(_username, '/', _contentPath);
    bytes32 urlHash = keccak256(bytes(url));
    require(userRegistry.hasUsername(msg.sender, authorId), 'user not registered or incorrect username');
    require(_contentHash != 0, 'hash is zero');
    require(contentMetadata[_contentHash].author == 0x00, 'content already published');
    require(contentUrlRegistry[urlHash] == 0x00, 'content path already published');
    contentMetadata[_contentHash] = ContentMetadata(url, authorId);
    contentUrlRegistry[urlHash] = keccak256(abi.encodePacked(_contentHash, authorId));
    emit PublishedContent(_contentHash, url, authorId);
  }

  function unpublish(bytes32 _contentHash) external {
    ContentMetadata storage content = contentMetadata[_contentHash];
    require(userRegistry.getUserAddress(content.author) == msg.sender, 'permission denied');
    bytes32 urlHash = keccak256(bytes(content.url));
    delete contentUrlRegistry[urlHash];
    delete contentMetadata[_contentHash];
    emit DeletedContent(_contentHash);
  }

  function isRegistered(bytes32 _contentHash) external view returns (bool) {
    return _contentHash != 0 && contentMetadata[_contentHash].author != 0x00;
  }

  function isUrlRegistered(string memory _url) external view returns (bool) {
    return contentUrlRegistry[keccak256(bytes(_url))] != 0x00;
  }

  function getAuthor(bytes32 _contentHash) external view returns (bytes32) {
    return contentMetadata[_contentHash].author;
  }

  function getAuthorAddress(bytes32 _contentHash) external view returns (address) {
    return userRegistry.getUserAddress(contentMetadata[_contentHash].author);
  }

  function getUrl(bytes32 _contentHash) external view returns (string memory) {
    return contentMetadata[_contentHash].url;
  }

}