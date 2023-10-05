// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/Proxy.sol";
import "../IUserRegistry.sol";
import "../EternalStorage.sol";
import "../IOrganisation.sol";

abstract contract ContentStorage is EternalStorage {

  struct ContentMetadata {
    string url;
    bytes32 author;
  }

  IUserRegistry public userRegistry;
  mapping (bytes32 => ContentMetadata) public contentMetadata;
  mapping (bytes32 => bytes32) public contentUrlRegistry;

  bytes32 _endOfStorage = END_OF_STORAGE;

}


contract ContentRegistry is ContentStorage, Proxy {

  event UserRegistryChanged(address indexed registry);

  constructor(IUserRegistry _registry) {
    userRegistry = _registry;
    _initialiseStorageContract();
  }

  function setUserRegistry(IUserRegistry _registry) external onlyOwner {
    userRegistry = _registry;
    emit UserRegistryChanged(address(_registry));
  }

  function _implementation() internal view override returns (address) {
    return implementationContract;
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

  function getUrl(bytes32 _contentHash) external view returns (string memory) {
    return contentMetadata[_contentHash].url;
  }

  function getAuthorAddress(bytes32 _contentHash) external view returns (address) {
    return userRegistry.getUserAddress(contentMetadata[_contentHash].author);
  }

}


contract ContentPublisher is ContentStorage {

  event PublishedContent(
    bytes32 indexed hash,
    string url,
    bytes32 indexed author
  );

  event DeletedContent(
    bytes32 indexed hash
  );

  function initialise() external onlyOwner onlyProxy {
    _verifyEternalStorage(_endOfStorage);
    initialised = true;
  }

  function publish(bytes32 _contentHash, string memory _username, string memory _contentPath) external onlyProxy {
    bytes32 userId = keccak256(bytes(_username));
    _publish(userId, msg.sender, _contentHash, _username, _contentPath);
  }

  function unpublish(bytes32 _contentHash) external onlyProxy {
    ContentMetadata memory content = contentMetadata[_contentHash];
    _unpublish(content, msg.sender, _contentHash);
  }

  function publishAsOrg(bytes32 _contentHash, string memory _username, string memory _contentPath) external onlyProxy {
    bytes32 orgId = keccak256(bytes(_username));
    address org = userRegistry.getUserAddress(orgId);
    require(org != address(0), 'org not registered');
    require(IOrganisation(org).hasRole(PUBLISHER_ROLE, msg.sender), "permission denied");
    _publish(orgId, org, _contentHash, _username, _contentPath);
  }

  function unpublishAsOrg(bytes32 _contentHash) external onlyProxy {
    ContentMetadata memory content = contentMetadata[_contentHash];
    require(content.author != 0, 'content not found');
    address org = userRegistry.getUserAddress(content.author);
    require(org != address(0), 'org not registered');
    require(IOrganisation(org).hasRole(UNPUBLISHER_ROLE, msg.sender), "permission denied");
    _unpublish(content, org, _contentHash);
  }

  function _publish(bytes32 authorId, address _user, bytes32 _contentHash, string memory _username, string memory _contentPath) private {
    string memory url = string.concat(_username, '/', _contentPath);
    bytes32 urlHash = keccak256(bytes(url));
    require(userRegistry.hasUsername(_user, authorId), 'user not registered or incorrect username');
    require(_contentHash != 0, 'hash is zero');
    require(contentMetadata[_contentHash].author == 0x00, 'content already published');
    require(contentUrlRegistry[urlHash] == 0x00, 'content path already published');
    contentMetadata[_contentHash] = ContentMetadata(url, authorId);
    contentUrlRegistry[urlHash] = keccak256(abi.encodePacked(_contentHash, authorId));
    emit PublishedContent(_contentHash, url, authorId);
  }

  function _unpublish(ContentMetadata memory content, address _user, bytes32 _contentHash) private {
    require(userRegistry.getUserAddress(content.author) == _user, 'permission denied');
    bytes32 urlHash = keccak256(bytes(content.url));
    delete contentUrlRegistry[urlHash];
    delete contentMetadata[_contentHash];
    emit DeletedContent(_contentHash);
  }

}
