/**
 * Upgradeable smart contract abstract base class.
 *
 * An upgradeable contract has two parts: the Storage Contract and the Implementation Contract.
 * The Storage Contract is eternal. It holds the data that remains unchanged across upgrades and
 * cannot be upgraded. The Implementation Contract contains the upgradeable implementation, the 
 * methods that manipulate the eternal data.
 *
 * The Storage Contract must extend both this base class and the OpenZeppelin Proxy class. 
 * This base class contains the ownership and upgrade logic and a way for the Implementation
 * Contract to verify it has been written and upgraded correctly. The Proxy class allows
 * the Implementation Contract methods to be called as though they were direct members of the 
 * Storage Contract, executing them within the Storage Contract's address space. 
 *
 * This base class is designed to be used with the following class structure:
 *   1) abstract myEternalStorage extends EternalStorage
 *   2) myStorageContract extends myEternalStorage, Proxy
 *   3) myImplementationContract extends myEternalStorage
 *
 * By extending myEternalStorage in both the Storage Contract and the Implementation Contract,
 * the Implementation Contract can reference the eternal storage properties.
 *
 * The abstract myEternalStorage contains your eternal data declarations and must finally
 * declare a constant set to the END_OF_STORAGE marker below.  For example:
 *
 *   abstract contract myEternalStorage is EternalStorage {
 *     mapping(bytes32 => address) public myEternalMapping;
 *     address public myEternalVar;
 *     bytes32 _endOfStorage = END_OF_STORAGE;
 *   }
 *
 * (Note, the START_OF_STORAGE marker is set by this base class since this base class contains
 * properties necessary for upgradeability. The start and end markers are used to verify that
 * the Implementation Contract does not declare properties that clash with the eternal storage,
 * which could potentially corrupt the eternal storage).
 *
 * The Storage Contract must call `_initialiseStorageContract` during construction or 
 * initialisation to declare itself as the storage contract address. It must also override the
 * Proxy `_implementation` method. For example:
 *
 *   contract myStorageContract is myEternalStorage, Proxy {
 *     constructor() {
 *       _initialiseStorageContract();
 *     }
 *     function _implementation() internal view override returns (address) {
 *       return implementationContract;
 *     }
 *     ... Getter functions, if any ...
 *   }
 *
 * The Implementation Contract must call the `_verifyEternalStorage` method below at least once to
 * verify it has been written correctly and will not corrupt the eternal storage.  It must also
 * set the `initialised` flag to true. The Implementation Contract must not allow its methods to be 
 * called except from the Storage Contract (see the `onlyProxy` modifier) unless those methods do 
 * not use the eternal data. For example:
 *
 *   contract myImplementationContract is myEternalStorage {
 *     function initialise() external onlyOwner onlyProxy {
 *       _verifyEternalStorage(_endOfStorage);
 *       initialised = true;
 *     }
 *     function myMethod() external onlyProxy { ... }
 *   }
 *
 */

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;


/*
 * The Storage Markers are used to mark the limits of the eternal storage in the Storage Contract's
 * address space (storage slots). They are used solely to verify that an Implemenation Contract has
 * not declared properties that overlap the eternal storage address space and hence will not
 * corrupt eternal storage.
 */
bytes32 constant START_OF_STORAGE = 0x147df292245b268e1d0d7f6df9e2eb09c03566a12fd59b4a316187897454ea48;  // keccak256('BubbleProtocol-startOfStorageSlotMarker')
bytes32 constant END_OF_STORAGE = 0x5e0bae09bc77084a1c2da319fa7b831af8e7eafcb51a5dbabeb435047c49889b;  // keccak256('BubbleProtocol-endOfStorageSlotMarker')


abstract contract EternalStorage {

  modifier onlyOwner() {
    require(msg.sender == owner, 'permission denied');
    _;
  }

  /**
   * For use by Implementation Contract to confirm a method is being called within the Storage
   * Contract's address space.
   */
  modifier onlyProxy() {
    require(address(this) == storageContract, 'only the proxy can call this function');
    _;
  }

  /**
   * For use by Implementation Contract to confirm a method is NOT being called within the Storage
   * Contract's address space.
   */
  modifier notProxy() {
    require(address(this) != storageContract, 'the proxy is not permitted to call this function');
    _;
  }

  /**
   * Events
   */
  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
  event Upgraded(address indexed implementation);

  /**
   * Marks the start of eternal storage properties. The end marker must be declared by the
   * developer after declaring the custom eternal data properties.
   */
  bytes32 _startOfStorageSlotMarker = START_OF_STORAGE;

  /**
   * Eternal data properties needed to support upgradeability.
   */
  address public owner = msg.sender;
  address public storageContract;
  address public implementationContract;
  bool public initialised;

  
  /**
    * Transfers ownership of the contract to a new account (`newOwner`).
    * Only the owner can transfer ownership.
    */
  function transferOwner(address newOwner) public onlyOwner() {
    address oldOwner = owner;
    owner = newOwner;
    emit OwnershipTransferred(oldOwner, newOwner);
  }

  /**
   * Upgrades the proxy implementation of this contract.
   * Only the owner can upgrade.
   */
  function upgradeImplementation(address _contract) external onlyOwner {
    implementationContract = _contract;
    initialised = false;
    emit Upgraded(implementationContract);
  }

  /**
   * Protects against storage clashes. Should be called by the Implementation Contract to verify
   * it does not have storage slot clashes with the Storage Contract.
   *
   * Should be called after an upgrade when the new Implementation Contract is initialised.
   */
  function _verifyEternalStorage(bytes32 _endMarker) internal view {
    require(_startOfStorageSlotMarker == START_OF_STORAGE, 'storage slot error');
    require(_endMarker == END_OF_STORAGE, 'storage slot error');
  }

  /**
   * Must be called by the Storage Contract to declare itself as the address of the eternal
   * storage.
   */
  function _initialiseStorageContract() internal {
    storageContract = address(this);
  }

}

