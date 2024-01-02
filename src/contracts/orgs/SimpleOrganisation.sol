/**
 * A basic IOrganisation implementation. Gives other users permission to publish on behalf of your
 * organisation.
 */

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "../IOrganisation.sol";

contract SimpleOrganisation is IOrganisation, AccessControl {

  address public registrar;
  address payable tipRecipient;
  uint public fee;

  constructor(address _registrar, uint _fee) payable {
    registrar = _registrar;
    fee = _fee;
    tipRecipient = payable(msg.sender);
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _grantRole(PUBLISHER_ROLE, msg.sender);
    _grantRole(UNPUBLISHER_ROLE, msg.sender);
  }

  function hasRole(bytes32 role, address account) public view override(IOrganisation, AccessControl) returns (bool) {
    return AccessControl.hasRole(role, account);
  }

  function setTipRecipient(address payable recipient) external onlyRole(DEFAULT_ADMIN_ROLE) {
    tipRecipient = recipient;
  }

  function claimFee() external {
    require(msg.sender == registrar, "permission denied");
    uint transferFee = fee;
    fee = 0;
    (bool sent, ) = payable(msg.sender).call{value: transferFee}("");
    require(sent, "Failed to claim fee");
  }

  function withdraw() external onlyRole(DEFAULT_ADMIN_ROLE) {
    payable(msg.sender).transfer(address(this).balance);
  }

  receive() external payable {
    if (tipRecipient != address(0)) {
        (bool sent, ) = tipRecipient.call{value: msg.value}("");
        require(sent, "Failed to forward tip");
    }
  }

}
