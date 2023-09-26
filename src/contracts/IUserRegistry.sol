// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/**
 * Manages the app's user accounts.  Each account has 
 */
interface IUserRegistry {

  /**
   * Returns the address associated with the given user id.
   * Reverts if the user is not registered.
   */
  function getUserAddress(bytes32 _usernameHash) external view returns (address);

  /**
   * Returns true if the given id has been registered
   */
  function isRegistered(bytes32 _usernameHash) external view returns (bool);

  /**
   * Returns true if the given username has been registered
   */
  function isRegistered(string memory _username) external view returns (bool);

  /**
   * Returns true if the given address is a registered user and has the given username (by hash)
   */
  function hasUsername(address _user, bytes32 _usernameHash) external view returns (bool);

  /**
   * Returns true if the given address is a registered user and has the given username
   */
  function hasUsername(address _user, string memory _username) external view returns (bool);

}
