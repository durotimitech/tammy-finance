import crypto from 'crypto';

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const SALT_LENGTH = 32; // 256 bits
const IV_LENGTH = 12; // 96 bits for GCM
const KEY_LENGTH = 32; // 256 bits
const ITERATIONS = 100000; // PBKDF2 iterations

/**
 * Derives an encryption key from a user secret and salt
 */
function deriveKey(userSecret: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(userSecret, salt, ITERATIONS, KEY_LENGTH, 'sha256');
}

/**
 * Encrypts an API key using AES-256-GCM
 * @param apiKey The API key to encrypt
 * @param userSecret The user's secret (e.g., derived from session)
 * @returns Object containing encrypted value, salt, iv, and auth tag
 */
export function encryptApiKey(
  apiKey: string,
  userSecret: string,
): {
  encryptedValue: string;
  salt: string;
  iv: string;
  authTag: string;
} {
  // Generate random salt and IV
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);

  // Derive key from user secret and salt
  const key = deriveKey(userSecret, salt);

  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  // Encrypt the API key
  const encrypted = Buffer.concat([cipher.update(apiKey, 'utf8'), cipher.final()]);

  // Get the authentication tag
  const authTag = cipher.getAuthTag();

  return {
    encryptedValue: encrypted.toString('base64'),
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
  };
}

/**
 * Decrypts an API key using AES-256-GCM
 * @param encryptedData The encrypted data including value, salt, iv, and auth tag
 * @param userSecret The user's secret (e.g., derived from session)
 * @returns The decrypted API key
 */
export function decryptApiKey(
  encryptedData: {
    encryptedValue: string;
    salt: string;
    iv: string;
    authTag: string;
  },
  userSecret: string,
): string {
  // Convert from base64
  const salt = Buffer.from(encryptedData.salt, 'base64');
  const iv = Buffer.from(encryptedData.iv, 'base64');
  const authTag = Buffer.from(encryptedData.authTag, 'base64');
  const encrypted = Buffer.from(encryptedData.encryptedValue, 'base64');

  // Derive key from user secret and salt
  const key = deriveKey(userSecret, salt);

  // Create decipher
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  // Decrypt
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

  return decrypted.toString('utf8');
}

/**
 * Generates a user secret from session data
 * This should be deterministic for a given user session
 * @param userId The user's ID
 * @param sessionId A session identifier
 * @param encryptionSecret The application's encryption secret
 * @returns A derived user secret
 */
export function generateUserSecret(
  userId: string,
  sessionId: string,
  encryptionSecret: string,
): string {
  // Create a deterministic secret based on user session
  // This ensures the same user can decrypt their data across requests
  // but different users cannot decrypt each other's data
  const combined = `${userId}:${sessionId}:${encryptionSecret}`;
  return crypto.createHash('sha256').update(combined).digest('base64');
}
