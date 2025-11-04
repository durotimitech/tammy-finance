'use client';

import {
  EncryptedPayload,
  ALGORITHM,
  KEY_LENGTH,
  IV_LENGTH,
  SALT_LENGTH,
  ITERATIONS,
} from './shared';

/**
 * Converts a string to an ArrayBuffer
 */
function stringToArrayBuffer(str: string): ArrayBuffer {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(str);
  // Ensure we return an ArrayBuffer, not SharedArrayBuffer
  const buffer = encoded.buffer;
  if (buffer instanceof ArrayBuffer) {
    return buffer.slice(encoded.byteOffset, encoded.byteOffset + encoded.byteLength);
  }
  // If it's a SharedArrayBuffer, copy to a new ArrayBuffer
  const arrayBuffer = new ArrayBuffer(encoded.byteLength);
  const view = new Uint8Array(arrayBuffer);
  view.set(encoded);
  return arrayBuffer;
}

/**
 * Converts an ArrayBuffer to a base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Generates a random salt
 */
async function generateSalt(): Promise<ArrayBuffer> {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH)).buffer;
}

/**
 * Generates a random IV
 */
async function generateIV(): Promise<ArrayBuffer> {
  return crypto.getRandomValues(new Uint8Array(IV_LENGTH)).buffer;
}

/**
 * Derives an encryption key from a password and salt
 */
async function deriveKey(password: string, salt: ArrayBuffer): Promise<CryptoKey> {
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    stringToArrayBuffer(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey'],
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt'],
  );
}

/**
 * Encrypts a value using AES-GCM in the browser
 * @param value The value to encrypt
 * @param password A password derived from user data
 * @returns Encrypted payload
 */
export async function encryptValue(value: string, password: string): Promise<EncryptedPayload> {
  // Check if Web Crypto API is available
  if (!crypto.subtle) {
    throw new Error('Web Crypto API is not available. Please use a modern browser.');
  }

  try {
    // Generate salt and IV
    const salt = await generateSalt();
    const iv = await generateIV();

    // Derive encryption key
    const key = await deriveKey(password, salt);

    // Encrypt the value
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv: iv,
      },
      key,
      stringToArrayBuffer(value),
    );

    // Extract auth tag (last 16 bytes for GCM)
    const encryptedArray = new Uint8Array(encryptedBuffer);
    const ciphertext = encryptedArray.slice(0, -16);
    const authTag = encryptedArray.slice(-16);

    return {
      encryptedValue: arrayBufferToBase64(
        ciphertext.buffer.slice(
          ciphertext.byteOffset,
          ciphertext.byteOffset + ciphertext.byteLength,
        ),
      ),
      salt: arrayBufferToBase64(salt),
      iv: arrayBufferToBase64(iv),
      authTag: arrayBufferToBase64(
        authTag.buffer.slice(authTag.byteOffset, authTag.byteOffset + authTag.byteLength),
      ),
      algorithm: ALGORITHM,
      keyDerivation: {
        iterations: ITERATIONS,
        hash: 'SHA-256',
      },
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt value. Please try again.');
  }
}

/**
 * Generates a client-side password from user data
 * This should be deterministic for a given user but unique per user
 */
export function generateClientPassword(userId: string, timestamp: number): string {
  // Combine user ID with timestamp to create a unique password
  // The timestamp ensures each encryption uses a different key
  return `${userId}-${timestamp}-client-encryption`;
}

/**
 * Checks if client-side encryption is supported
 */
export function isEncryptionSupported(): boolean {
  return !!(crypto && crypto.subtle);
}
