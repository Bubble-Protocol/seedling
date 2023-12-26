// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

interface IPublication {

  function name() external returns (string memory);
  
  function publisher() external returns (address);

}
