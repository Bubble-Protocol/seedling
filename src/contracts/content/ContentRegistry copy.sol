// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "../IUserRegistry.sol";

contract ContentRegistry2 {

  event PublishedContent(
    bytes32 hash,
    string url,
    address indexed author,
    uint indexed time,
    string[] tags
  );

  event DeletedContent(
    bytes32 hash,
    uint indexed time
  );

  struct ContentMetadata {
    string url;
    address author;
  }

  IUserRegistry public userRegistry;
  mapping (bytes32 => ContentMetadata) public contentMetadata;
  mapping (bytes32 => bytes32) contentUrlRegistry;

  constructor (IUserRegistry _userRegistry) {
    userRegistry = _userRegistry;
  }

  function publish(bytes32 _contentHash, string memory _username, string memory _contentPath, string[] memory tags) external {
    assertIsLowerCase(_contentPath);
    address author = msg.sender;
    string memory url = string.concat(_username, '/', _contentPath);
    bytes32 urlHash = keccak256(bytes(url));
    require(userRegistry.hasUsername(author, _username), 'user not registered or incorrect username');
    require(_contentHash != 0, 'hash is zero');
    require(contentMetadata[_contentHash].author == address(0), 'content already published');
    require(contentUrlRegistry[urlHash] == 0x00, 'content path already published');
    contentMetadata[_contentHash] = ContentMetadata(url, author);
    contentUrlRegistry[urlHash] = keccak256(abi.encodePacked(_contentHash, author));
    emit PublishedContent(_contentHash, url, author, block.timestamp, tags);
  }

  function update(bytes32 _contentHash, string[] memory tags) external {
    address author = msg.sender;
    ContentMetadata memory metadata = contentMetadata[_contentHash];
    require(_contentHash != 0, 'hash is zero');
    require(author == metadata.author, 'permission denied');
    require(metadata.author != address(0), 'content not published');
    emit PublishedContent(_contentHash, metadata.url, metadata.author, block.timestamp, tags);
  }

  function unpublish(bytes32 _contentHash) external {
    ContentMetadata storage content = contentMetadata[_contentHash];
    require(content.author == msg.sender, 'permission denied');
    bytes32 urlHash = keccak256(bytes(content.url));
    delete contentUrlRegistry[urlHash];
    delete contentMetadata[_contentHash];
    emit DeletedContent(_contentHash, block.timestamp);
  }

  function isRegistered(bytes32 _contentHash) external view returns (bool) {
    return _contentHash != 0 && contentMetadata[_contentHash].author != address(0);
  }

  function isUrlRegistered(string memory _url) external view returns (bool) {
    return contentUrlRegistry[keccak256(bytes(_url))] != 0x00;
  }

  function isRegisteredAndValid(bytes32 _contentHash, string memory _url, address _author) external view returns (bool) {
    bytes32 contentHash = contentUrlRegistry[keccak256(bytes(_url))];
    return _contentHash != 0 && _contentHash == contentHash && contentMetadata[_contentHash].author == _author;
  }

  function assertIsLowerCase(string memory str) internal pure {
    bytes memory byteArray = bytes(str);
    for(uint i = 0; i < byteArray.length; i++) {
      require(byteArray[i] < 0x41 || byteArray[i] > 0x5A, "uppercase chars are not permitted");
    }
  }

}
