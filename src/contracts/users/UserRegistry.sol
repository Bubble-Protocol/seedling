// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/Proxy.sol";
import "../IUserRegistry.sol";
import "../EternalStorage.sol";

/**
 * Manages the app's user accounts.  Each account has 
 */
abstract contract UserRegistryStorage is EternalStorage, AccessControl {

  mapping(bytes32 => address) public users;

  bytes32 _endOfStorage = END_OF_STORAGE;

}


contract UserRegistry is UserRegistryStorage, IUserRegistry, Proxy {

  constructor() {
    _initialiseStorageContract();
  }

  function _implementation() internal view override returns (address) {
    return implementationContract;
  }

  function getUserAddress(bytes32 _usernameHash) external view override returns (address) {
    return users[_usernameHash];
  }

  function getUserAddress(string memory _username) external view override returns (address) {
    return users[keccak256(bytes(_username))];
  }

  function isRegistered(bytes32 _usernameHash) external view override returns (bool) {
    return users[_usernameHash] != address(0);
  }

  function isRegistered(string memory _username) external view override returns (bool) {
    return users[keccak256(bytes(_username))] != address(0);
  }

  function hasUsername(address _user, bytes32 _usernameHash) public view override returns (bool) {
    return users[_usernameHash] == _user;
  }

  function hasUsername(address _user, string memory _username) public view override returns (bool) {
    return users[keccak256(bytes(_username))] == _user;
  }

}


contract UserManager is UserRegistryStorage {

  event UserRegistered (
    bytes32 indexed id,
    string username,
    address indexed user
  );

  event UserDeregistered (
    bytes32 indexed id
  );

  bytes32 public constant REGISTER_ROLE = keccak256("REGISTER_ROLE");

  // calldata: 0x592e6f59
  function initialise() external onlyOwner onlyProxy {
    _verifyEternalStorage(_endOfStorage);
    require(!initialised, 'already initialised');
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    initialised = true;
  }

  function register(string memory _username, address _user) external onlyRole(REGISTER_ROLE) onlyProxy {
    bytes32 uHash = keccak256(bytes(_username));
    require(users[uHash] == address(0), "username already registered");
    users[uHash] = _user;
    emit UserRegistered(uHash, _username, _user);
  }

  function deregister(bytes32 _usernameHash) external onlyProxy {
    require(hasRole(REGISTER_ROLE, msg.sender) || users[_usernameHash] == msg.sender, "permission denied");
    delete users[_usernameHash];
    emit UserDeregistered(_usernameHash);
  }

}
