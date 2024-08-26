NB: UserRegistry-modified.json is manually created for the application to overcome two problems:
1. the user registry contract is an upgradeable contract and so is a concatenation of the UserRegistry and UserManager ABIs.
2. wagmi incorrectly uses the isRegistered(string) method instead of the isRegistered(bytes32) method. Hence the isRegistered(string) method abi has been removed.