const axios = require("axios");

/**
 * IPFS Service — uploads data to Pinata (free tier).
 */

const PINATA_BASE_URL = "https://api.pinata.cloud";

/**
 * Upload JSON data to IPFS via Pinata.
 */
const uploadToIPFS = async (jsonData, name) => {
  const apiKey = process.env.PINATA_API_KEY;
  const secretKey = process.env.PINATA_SECRET_KEY;

  if (!apiKey || !secretKey) {
    console.warn("⚠️  Pinata API keys not configured. Skipping IPFS upload.");
    return { ipfsHash: null, ipfsUrl: null };
  }

  try {
    const response = await axios.post(
      `${PINATA_BASE_URL}/pinning/pinJSONToIPFS`,
      {
        pinataContent: jsonData,
        pinataMetadata: {
          name: name || `rozgarid-${Date.now()}`,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          pinata_api_key: apiKey,
          pinata_secret_api_key: secretKey,
        },
      }
    );

    const ipfsHash = response.data.IpfsHash;
    return {
      ipfsHash,
      ipfsUrl: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
    };
  } catch (error) {
    console.error("IPFS upload error:", error.message);
    return { ipfsHash: null, ipfsUrl: null };
  }
};

module.exports = { uploadToIPFS };
