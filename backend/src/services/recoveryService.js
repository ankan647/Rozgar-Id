const crypto = require("crypto");
const CryptoJS = require("crypto-js");
const bcrypt = require("bcryptjs");

/**
 * Recovery Service — social recovery for worker wallets.
 */

const WORD_LIST = [
  "apple", "brave", "coral", "dawn", "eagle", "flame", "grace", "honor",
  "ivory", "jewel", "karma", "lotus", "maple", "noble", "ocean", "pearl",
  "quest", "river", "solar", "tiger", "unity", "vivid", "woven", "xenon",
  "yield", "zenith", "amber", "bloom", "cedar", "drift", "ember", "frost",
  "glade", "haven", "inlet", "jade", "knoll", "lumen", "marsh", "nexus",
  "oasis", "pique", "reign", "shore", "trove", "urban", "vault", "whirl",
];

/**
 * Generate a 6-word recovery phrase.
 */
const generateRecoveryPhrase = () => {
  const words = [];
  for (let i = 0; i < 6; i++) {
    const idx = crypto.randomInt(0, WORD_LIST.length);
    words.push(WORD_LIST[idx]);
  }
  return words.join(" ");
};

/**
 * Hash a recovery phrase for storage.
 */
const hashRecoveryPhrase = async (phrase) => {
  return await bcrypt.hash(phrase, 12);
};

/**
 * Validate a recovery phrase against its hash.
 */
const validateRecoveryPhrase = async (phrase, hash) => {
  return await bcrypt.compare(phrase, hash);
};

/**
 * Encrypt credential backup data for social recovery.
 */
const encryptBackup = (data, passphrase) => {
  const jsonStr = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonStr, passphrase).toString();
};

/**
 * Decrypt credential backup data.
 */
const decryptBackup = (encrypted, passphrase) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, passphrase);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  } catch (error) {
    throw new Error("Invalid recovery phrase or corrupted backup");
  }
};

module.exports = {
  generateRecoveryPhrase,
  hashRecoveryPhrase,
  validateRecoveryPhrase,
  encryptBackup,
  decryptBackup,
};
