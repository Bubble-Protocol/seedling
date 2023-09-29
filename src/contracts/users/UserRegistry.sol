// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "../IUserRegistry.sol";

contract UserRegistry is IUserRegistry, AccessControl {

  event UserRegistered (
    bytes32 indexed id,
    string username,
    address indexed user
  );

  event UserDeregistered (
    bytes32 indexed id
  );

  bytes32 public constant REGISTER_ROLE = keccak256("REGISTER_ROLE");

  mapping(bytes32 => address) public users;

  constructor() {
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
  }

  function register(string memory _username, address _user) external onlyRole(REGISTER_ROLE) {
    bytes32 uHash = keccak256(bytes(_username));
    require(users[uHash] == address(0), "username already registered");
    users[uHash] = _user;
    emit UserRegistered(uHash, _username, _user);
  }

  function deregister(bytes32 _usernameHash) external {
    require(hasRole(REGISTER_ROLE, msg.sender) || users[_usernameHash] == msg.sender, "permission denied");
    delete users[_usernameHash];
    emit UserDeregistered(_usernameHash);
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
