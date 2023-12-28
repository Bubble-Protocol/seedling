/**
 * A basic IOrganisation implementation. Gives other users permission to publish on behalf of your
 * organisation.
 */

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "../IOrganisation.sol";

contract SimpleOrganisation is IOrganisation, AccessControl {

  address public registry;

  constructor(address _registry) payable {
    registry = _registry;
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _grantRole(PUBLISHER_ROLE, msg.sender);
    _grantRole(UNPUBLISHER_ROLE, msg.sender);
  }

  function hasRole(bytes32 role, address account) public view override(IOrganisation, AccessControl) returns (bool) {
    return AccessControl.hasRole(role, account);
  }

  function claimFee() external {
    require(msg.sender == registry || hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "permission denied");
    payable(msg.sender).transfer(address(this).balance);
  }

}
