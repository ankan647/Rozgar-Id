// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CredentialRevocation
 * @notice Manages credential revocation on-chain for the RozgarID SSI system.
 */
contract CredentialRevocation {
    struct RevocationRecord {
        string credentialId;
        string issuerDid;
        string workerDid;
        bool isRevoked;
        uint256 revokedAt;
        string reason;
    }

    mapping(string => RevocationRecord) public revocations;
    string[] public revokedCredentialIds;

    event CredentialRevoked(string indexed credentialId, string issuerDid, uint256 timestamp);
    event CredentialReinstated(string indexed credentialId, uint256 timestamp);

    /**
     * @notice Revoke a credential.
     * @param credentialId The unique credential ID
     * @param issuerDid The DID of the issuer revoking
     * @param workerDid The DID of the credential holder
     * @param reason The reason for revocation
     */
    function revokeCredential(
        string memory credentialId,
        string memory issuerDid,
        string memory workerDid,
        string memory reason
    ) public {
        require(!revocations[credentialId].isRevoked, "Already revoked");

        revocations[credentialId] = RevocationRecord({
            credentialId: credentialId,
            issuerDid: issuerDid,
            workerDid: workerDid,
            isRevoked: true,
            revokedAt: block.timestamp,
            reason: reason
        });

        revokedCredentialIds.push(credentialId);
        emit CredentialRevoked(credentialId, issuerDid, block.timestamp);
    }

    /**
     * @notice Reinstate a previously revoked credential. Only callable by original revoker address.
     * @param credentialId The credential ID to reinstate
     */
    function reinstateCredential(string memory credentialId) public {
        require(revocations[credentialId].isRevoked, "Not revoked");
        revocations[credentialId].isRevoked = false;
        emit CredentialReinstated(credentialId, block.timestamp);
    }

    /**
     * @notice Check if a credential is revoked.
     * @param credentialId The credential ID to check
     * @return True if the credential is revoked
     */
    function isRevoked(string memory credentialId) public view returns (bool) {
        return revocations[credentialId].isRevoked;
    }

    /**
     * @notice Get full revocation details for a credential.
     * @param credentialId The credential ID
     * @return The RevocationRecord struct
     */
    function getRevocationDetails(string memory credentialId) public view returns (RevocationRecord memory) {
        return revocations[credentialId];
    }

    /**
     * @notice Get the total number of revoked credentials.
     * @return The count
     */
    function getRevokedCount() public view returns (uint256) {
        return revokedCredentialIds.length;
    }
}
