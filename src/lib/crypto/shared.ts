// Shared crypto constants and types used by both client and server

export const ALGORITHM = 'AES-GCM';
export const KEY_LENGTH = 256; // bits
export const IV_LENGTH = 12; // bytes for GCM
export const SALT_LENGTH = 32; // bytes
export const TAG_LENGTH = 16; // bytes for GCM
export const ITERATIONS = 100000; // PBKDF2 iterations

export interface EncryptedPayload {
  encryptedValue: string;
  salt: string;
  iv: string;
  authTag: string;
  algorithm: string;
  keyDerivation: {
    iterations: number;
    hash: string;
  };
}

export interface CredentialRequest {
  name: string;
  value: string | EncryptedPayload;
  isEncrypted?: boolean;
}
