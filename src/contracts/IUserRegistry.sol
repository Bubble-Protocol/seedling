// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/**
 * Minimum interface for the User Registry. The getter functions declared in this interface can
 * be used by the Content Registry and TipJar to query user information.
 */
interface IUserRegistry {

  /**
   * Returns the address associated with the given user account.  
   * Caller should check for address(0) to confirm the user is registered.
   */
  function getUserAddress(bytes32 _usernameHash) external view returns (address);

  /**
   * Returns the address associated with the given username.  
   * Caller should check for address(0) to confirm the user is registered.
   */
  function getUserAddress(string memory _username) external view returns (address);

  /**
   * Returns true if the given account has been registered
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
