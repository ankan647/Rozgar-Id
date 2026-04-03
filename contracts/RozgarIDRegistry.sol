// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RozgarIDRegistry
 * @notice Stores DID registrations on-chain for the RozgarID SSI system.
 */
contract RozgarIDRegistry {
    struct DIDRecord {
        string did;
        address owner;
        string didDocumentHash; // IPFS hash of the DID document
        bool isActive;
        uint256 registeredAt;
        uint256 updatedAt;
    }

    mapping(string => DIDRecord) public didRegistry;
    mapping(address => string) public addressToDid;

    event DIDRegistered(string indexed did, address indexed owner, uint256 timestamp);
    event DIDUpdated(string indexed did, uint256 timestamp);
    event DIDDeactivated(string indexed did, uint256 timestamp);

    /**
     * @notice Register a new DID on-chain.
     * @param did The DID string (e.g., "did:key:z6Mk...")
     * @param didDocumentHash The IPFS hash of the DID document
     */
    function registerDID(string memory did, string memory didDocumentHash) public {
        require(bytes(didRegistry[did].did).length == 0, "DID already registered");

        didRegistry[did] = DIDRecord({
            did: did,
            owner: msg.sender,
            didDocumentHash: didDocumentHash,
            isActive: true,
            registeredAt: block.timestamp,
            updatedAt: block.timestamp
        });

        addressToDid[msg.sender] = did;
        emit DIDRegistered(did, msg.sender, block.timestamp);
    }

    /**
     * @notice Update the DID document hash for an existing DID.
     * @param did The DID to update
     * @param newDocumentHash The new IPFS hash
     */
    function updateDID(string memory did, string memory newDocumentHash) public {
        require(didRegistry[did].owner == msg.sender, "Not DID owner");
        require(didRegistry[did].isActive, "DID is deactivated");

        didRegistry[did].didDocumentHash = newDocumentHash;
        didRegistry[did].updatedAt = block.timestamp;
        emit DIDUpdated(did, block.timestamp);
    }

    /**
     * @notice Deactivate a DID. Only the owner can deactivate.
     * @param did The DID to deactivate
     */
    function deactivateDID(string memory did) public {
        require(didRegistry[did].owner == msg.sender, "Not DID owner");
        didRegistry[did].isActive = false;
        didRegistry[did].updatedAt = block.timestamp;
        emit DIDDeactivated(did, block.timestamp);
    }

    /**
     * @notice Resolve a DID to its full record.
     * @param did The DID to resolve
     * @return The DIDRecord struct
     */
    function resolveDID(string memory did) public view returns (DIDRecord memory) {
        return didRegistry[did];
    }

    /**
     * @notice Check if a DID is currently active.
     * @param did The DID to check
     * @return True if the DID is active
     */
    function isDIDActive(string memory did) public view returns (bool) {
        return didRegistry[did].isActive;
    }
}
