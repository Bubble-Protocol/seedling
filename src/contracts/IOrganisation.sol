// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

bytes32 constant PUBLISHER_ROLE = 0x6a41cfdef4ebefe7ff082a10fe14f1a8447c4f3bc48bf69c0b2f746a73b3325c;    // keccak256('Seedling.Organisation.Roles.PUBLISHER')
bytes32 constant UNPUBLISHER_ROLE = 0x37c44659e8429a42fa596cc0b8b6e772355d36bdf3c67fae22dc84c710f77b70;  // keccak256('Seedling.Organisation.Roles.UNPUBLISHER')

interface IOrganisation {

  function hasRole(bytes32 role, address account) external view returns (bool);

  function claimFee() external;

}