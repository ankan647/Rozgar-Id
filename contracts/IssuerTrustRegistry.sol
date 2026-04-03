// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title IssuerTrustRegistry
 * @notice Manages trusted issuers for the RozgarID SSI system.
 * @dev Only the contract owner (deployer) can add/revoke trusted issuers.
 */
contract IssuerTrustRegistry is Ownable {
    struct IssuerRecord {
        string did;
        string name;
        string issuerType;
        bool isTrusted;
        uint256 addedAt;
    }

    mapping(string => IssuerRecord) public trustedIssuers;
    string[] public issuerDids;

    event IssuerTrusted(string indexed did, string name, uint256 timestamp);
    event IssuerRevoked(string indexed did, uint256 timestamp);

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Add a trusted issuer to the registry.
     * @param did The issuer's DID
     * @param name The issuer's name
     * @param issuerType The type of issuer (training_institute, employer, etc.)
     */
    function addTrustedIssuer(
        string memory did,
        string memory name,
        string memory issuerType
    ) public onlyOwner {
        trustedIssuers[did] = IssuerRecord({
            did: did,
            name: name,
            issuerType: issuerType,
            isTrusted: true,
            addedAt: block.timestamp
        });

        issuerDids.push(did);
        emit IssuerTrusted(did, name, block.timestamp);
    }

    /**
     * @notice Revoke trust from an issuer.
     * @param did The issuer's DID to revoke
     */
    function revokeTrustedIssuer(string memory did) public onlyOwner {
        require(trustedIssuers[did].isTrusted, "Issuer not trusted");
        trustedIssuers[did].isTrusted = false;
        emit IssuerRevoked(did, block.timestamp);
    }

    /**
     * @notice Check if an issuer is trusted.
     * @param did The issuer's DID
     * @return True if the issuer is trusted
     */
    function isIssuerTrusted(string memory did) public view returns (bool) {
        return trustedIssuers[did].isTrusted;
    }

    /**
     * @notice Get issuer details.
     * @param did The issuer's DID
     * @return The IssuerRecord struct
     */
    function getIssuerDetails(string memory did) public view returns (IssuerRecord memory) {
        return trustedIssuers[did];
    }

    /**
     * @notice Get the total number of registered issuers.
     * @return The count
     */
    function getIssuerCount() public view returns (uint256) {
        return issuerDids.length;
    }
}
