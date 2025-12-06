// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FileStamp
 * @dev Smart contract for storing file hashes on blockchain
 * @notice Provides immutable proof of file ownership and authenticity
 */
contract FileStamp {
    // Struct to store stamp information
    struct Stamp {
        address owner;
        uint256 timestamp;
        bool isPublic;
    }

    // Mapping from file hash to stamp information
    mapping(bytes32 => Stamp) public stamps;

    // Event emitted when a file is stamped
    event FileStamped(
        bytes32 indexed fileHash,
        address indexed owner,
        uint256 timestamp,
        bool isPublic
    );

    /**
     * @dev Stamp a file hash on the blockchain
     * @param fileHash The SHA-256 hash of the file
     * @param isPublic Whether the stamp is publicly verifiable
     * @notice Reverts if the file hash already exists
     */
    function stampFile(bytes32 fileHash, bool isPublic) external {
        require(stamps[fileHash].owner == address(0), "File already stamped");
        
        stamps[fileHash] = Stamp({
            owner: msg.sender,
            timestamp: block.timestamp,
            isPublic: isPublic
        });

        emit FileStamped(fileHash, msg.sender, block.timestamp, isPublic);
    }

    /**
     * @dev Verify if a file hash exists on the blockchain
     * @param fileHash The SHA-256 hash of the file to verify
     * @return exists True if the file hash exists, false otherwise
     * @return owner The address that stamped the file (address(0) if not found)
     * @return timestamp The block timestamp when the file was stamped (0 if not found)
     * @return isPublic Whether the stamp is publicly verifiable
     */
    function verifyFile(bytes32 fileHash) 
        external 
        view 
        returns (bool exists, address owner, uint256 timestamp, bool isPublic) 
    {
        Stamp memory stamp = stamps[fileHash];
        
        if (stamp.owner == address(0)) {
            return (false, address(0), 0, false);
        }

        return (true, stamp.owner, stamp.timestamp, stamp.isPublic);
    }

    /**
     * @dev Get detailed stamp information
     * @param fileHash The SHA-256 hash of the file
     * @return stamp The complete stamp information
     */
    function getStampInfo(bytes32 fileHash) 
        external 
        view 
        returns (Stamp memory stamp) 
    {
        return stamps[fileHash];
    }

    /**
     * @dev Check if a file hash exists (simple boolean check)
     * @param fileHash The SHA-256 hash of the file
     * @return True if the file hash exists, false otherwise
     */
    function fileExists(bytes32 fileHash) external view returns (bool) {
        return stamps[fileHash].owner != address(0);
    }
}

