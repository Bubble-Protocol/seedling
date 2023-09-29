// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

bytes32 constant START_OF_STORAGE = 0x147df292245b268e1d0d7f6df9e2eb09c03566a12fd59b4a316187897454ea48;  // keccak256('BubbleProtocol-startOfStorageSlotMarker')
bytes32 constant END_OF_STORAGE = 0x5e0bae09bc77084a1c2da319fa7b831af8e7eafcb51a5dbabeb435047c49889b;  // keccak256('BubbleProtocol-endOfStorageSlotMarker')


abstract contract EternalStorage {

  modifier onlyOwner() {
    require(msg.sender == owner, 'permission denied');
    _;
  }

  modifier onlyProxy() {
    require(address(this) == storageContract, 'only the proxy can call this function');
    _;
  }

  modifier notProxy() {
    require(address(this) != storageContract, 'the proxy is not permitted to call this function');
    _;
  }

  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
  event Upgraded(address indexed implementation);

  bytes32 _startOfStorageSlotMarker = START_OF_STORAGE;

  address public owner = msg.sender;
  address public storageContract;
  address public implementationContract;
  bool public initialised;

  
  /**
    * @dev Transfers ownership of the contract to a new account (`newOwner`).
    * Can only be called by the current owner.
    */
  function transferOwner(address newOwner) public onlyOwner() {
    address oldOwner = owner;
    owner = newOwner;
    emit OwnershipTransferred(oldOwner, newOwner);
  }

  /**
   * @dev Upgrades the proxy implementation of this contract
   */
  function upgradeImplementation(address _contract) external onlyOwner {
    implementationContract = _contract;
    initialised = false;
    emit Upgraded(implementationContract);
  }

  /**
   * @dev Protects against storage clashes.  Can be called by the implementation contract
   * to verify it does not have storage slot clashes with the storage contract.
   *
   * Should be called by a proxy function to confirm storage slots are setup correctly.
   * At the very least, this should be called once via the fallback function to test the proxy 
   * implementation has been designed correctly.  Consider calling in the implementation
   * contract's initialise function, if you have one.
   */
  function _verifyEternalStorage(bytes32 _endMarker) internal view {
    require(_startOfStorageSlotMarker == START_OF_STORAGE, 'storage slot error');
    require(_endMarker == END_OF_STORAGE, 'storage slot error');
  }

  /**
   * Must be called by the storage contract to declare it as the contract that holds the
   * eternal storage.
   */
  function _initialiseStorageContract() internal {
    storageContract = address(this);
  }

}

