/**
 * User Registry
 *
 * Manages the app's user accounts.  
 *
 * Each Seedling account is a unique 32-byte number, nominally a keccak256 hash derived from the 
 * platform and username of the user's chosed content host. The Seedling account is linked to the 
 * user's wallet address. Note, that the same wallet address can be linked to multiple accounts
 * allowing the user to publish from multiple hosts.
 *
 * The User Registry is an upgradeable smart contract designed to allow trusted registrars to 
 * register new users and organisations. The contract is responsible for maintaining the set of
 * registered users, emitting events when a user is registered or deregistered, and enforcing 
 * unique usernames.
 */

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/Proxy.sol";
import "../IUserRegistry.sol";
import "../EternalStorage.sol";
import "../IOrganisation.sol";


/**
 * The registry data definition. Non-upgradeable eternal storage.
 */
abstract contract UserRegistryStorage is EternalStorage, AccessControl {

  mapping(bytes32 => address) public users;

  bytes32 internal _endOfStorage = END_OF_STORAGE;

}


/**
 * The registry storage contract. The eternal data plus getter functions. Non-upgradeable.
 */
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


/**
 * Upgradeable registry implementation. Implements register and deregister functions and emits 
 * events. Charges a configurable fee for registering organisations. Only authorised registrars 
 * can register a user or organisation. Deregistration can be completed by the user/org or 
 * an authorised registrar.  
 */
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
  bytes32 public constant COLLECTOR_ROLE = keccak256("COLLECTOR_ROLE");

  function initialise() external onlyOwner onlyProxy {
    _verifyEternalStorage(_endOfStorage);
    require(!initialised, "already initialised");
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    initialised = true;
  }

  function register(string memory _username, address _user) external onlyRole(REGISTER_ROLE) onlyProxy {
    _register(_username, _user);
  }

  function deregister(bytes32 _usernameHash) external onlyProxy {
    require(hasRole(REGISTER_ROLE, msg.sender) || users[_usernameHash] == msg.sender, "permission denied");
    delete users[_usernameHash];
    emit UserDeregistered(_usernameHash);
  }

  function registerOrg(string memory _username, IOrganisation _org, uint _fee) external onlyRole(REGISTER_ROLE) onlyProxy {
    uint initialBalance = address(this).balance;
    _org.claimFee();
    uint feeClaimed = address(this).balance - initialBalance;
    require(feeClaimed >= _fee, "Insufficient fee");
    _register(_username, address(_org));
  }

  function _register(string memory _username, address _user) private {
    bytes32 uHash = keccak256(bytes(_username));
    require(users[uHash] == address(0), "username already registered");
    users[uHash] = _user;
    emit UserRegistered(uHash, _username, _user);
  }

  function withdraw() external onlyRole(COLLECTOR_ROLE) {
    uint256 balance = address(this).balance;
    require(balance > 0, "No funds to withdraw");
    payable(_msgSender()).transfer(balance);
  }

  receive() external payable {}

}
