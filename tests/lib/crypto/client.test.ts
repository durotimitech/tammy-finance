/**
 * @jest-environment jsdom
 */

import { TextEncoder, TextDecoder } from "util";
import {
  encryptValue,
  generateClientPassword,
  isEncryptionSupported,
} from "@/lib/crypto/client";

// Polyfill TextEncoder/TextDecoder for jsdom
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

// Polyfill btoa/atob for jsdom
if (typeof global.btoa === "undefined") {
  global.btoa = (str: string) => Buffer.from(str, "binary").toString("base64");
  global.atob = (str: string) => Buffer.from(str, "base64").toString("binary");
}

// Mock Web Crypto API
const mockEncrypt = jest.fn();
const mockDecrypt = jest.fn();
const mockImportKey = jest.fn();
const mockDeriveKey = jest.fn();
const mockGetRandomValues = jest.fn();

// Type-safe mock for Web Crypto API
const mockCrypto = {
  getRandomValues: mockGetRandomValues,
  subtle: {
    encrypt: mockEncrypt,
    decrypt: mockDecrypt,
    importKey: mockImportKey,
    deriveKey: mockDeriveKey,
  },
} as unknown as Crypto;

// Store original crypto
const originalCrypto = global.crypto;

describe("crypto/client", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock getRandomValues to return predictable values
    mockGetRandomValues.mockImplementation((array: Uint8Array) => {
      // Fill array with test data
      for (let i = 0; i < array.length; i++) {
        array[i] = i % 256;
      }
      return array;
    });

    // Mock importKey
    mockImportKey.mockResolvedValue({} as CryptoKey);

    // Mock deriveKey
    mockDeriveKey.mockResolvedValue({} as CryptoKey);

    // Mock encrypt to return a combined ciphertext + auth tag
    mockEncrypt.mockResolvedValue(
      new Uint8Array([
        // Ciphertext (16 bytes)
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
        // Auth tag (16 bytes)
        17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32,
      ]).buffer,
    );

    // Set mock crypto
    Object.defineProperty(global, "crypto", {
      value: mockCrypto,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    // Restore original crypto
    Object.defineProperty(global, "crypto", {
      value: originalCrypto,
      writable: true,
      configurable: true,
    });
  });

  describe("isEncryptionSupported", () => {
    it("returns true when Web Crypto API is available", () => {
      expect(isEncryptionSupported()).toBe(true);
    });

    it("returns false when Web Crypto API is not available", () => {
      // Temporarily remove crypto.subtle
      Object.defineProperty(global, "crypto", {
        value: { ...mockCrypto, subtle: undefined },
        writable: true,
        configurable: true,
      });

      expect(isEncryptionSupported()).toBe(false);
    });

    it("returns false when crypto is not available", () => {
      // Temporarily remove crypto
      Object.defineProperty(global, "crypto", {
        value: undefined,
        writable: true,
        configurable: true,
      });

      expect(isEncryptionSupported()).toBe(false);
    });
  });

  describe("generateClientPassword", () => {
    it("generates a unique password for different users", () => {
      const password1 = generateClientPassword("user1", 123456789);
      const password2 = generateClientPassword("user2", 123456789);

      expect(password1).not.toBe(password2);
      expect(password1).toContain("user1");
      expect(password2).toContain("user2");
    });

    it("generates a unique password for different timestamps", () => {
      const password1 = generateClientPassword("user1", 123456789);
      const password2 = generateClientPassword("user1", 987654321);

      expect(password1).not.toBe(password2);
      expect(password1).toContain("123456789");
      expect(password2).toContain("987654321");
    });

    it("generates consistent passwords for same input", () => {
      const password1 = generateClientPassword("user1", 123456789);
      const password2 = generateClientPassword("user1", 123456789);

      expect(password1).toBe(password2);
    });
  });

  describe("encryptValue", () => {
    it("successfully encrypts a value", async () => {
      const value = "test-api-key";
      const password = "test-password";

      const result = await encryptValue(value, password);

      // Verify structure
      expect(result).toHaveProperty("encryptedValue");
      expect(result).toHaveProperty("salt");
      expect(result).toHaveProperty("iv");
      expect(result).toHaveProperty("authTag");
      expect(result).toHaveProperty("algorithm", "AES-GCM");
      expect(result).toHaveProperty("keyDerivation");
      expect(result.keyDerivation).toEqual({
        iterations: 100000,
        hash: "SHA-256",
      });

      // Verify crypto API was called correctly
      expect(mockImportKey).toHaveBeenCalled();
      expect(mockDeriveKey).toHaveBeenCalled();
      expect(mockEncrypt).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "AES-GCM",
          iv: expect.any(ArrayBuffer),
        }),
        expect.any(Object),
        expect.any(ArrayBuffer),
      );
    });

    it("throws error when Web Crypto API is not available", async () => {
      // Temporarily remove crypto.subtle
      Object.defineProperty(global, "crypto", {
        value: { ...mockCrypto, subtle: undefined },
        writable: true,
        configurable: true,
      });

      await expect(encryptValue("test", "password")).rejects.toThrow(
        "Web Crypto API is not available. Please use a modern browser.",
      );
    });

    it("handles encryption errors gracefully", async () => {
      mockEncrypt.mockRejectedValueOnce(new Error("Encryption failed"));

      await expect(encryptValue("test", "password")).rejects.toThrow(
        "Failed to encrypt value. Please try again.",
      );
    });

    it("generates different encrypted values for same input", async () => {
      const value = "test-api-key";
      const password = "test-password";

      // Mock different random values for second call
      let callCount = 0;
      mockGetRandomValues.mockImplementation((array: Uint8Array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = (i + callCount * 100) % 256;
        }
        callCount++;
        return array;
      });

      const result1 = await encryptValue(value, password);
      const result2 = await encryptValue(value, password);

      // Salt and IV should be different due to random generation
      expect(result1.salt).not.toBe(result2.salt);
      expect(result1.iv).not.toBe(result2.iv);
    });

    it("produces base64 encoded output", async () => {
      const result = await encryptValue("test", "password");

      // Check that all outputs are valid base64
      expect(() => atob(result.encryptedValue)).not.toThrow();
      expect(() => atob(result.salt)).not.toThrow();
      expect(() => atob(result.iv)).not.toThrow();
      expect(() => atob(result.authTag)).not.toThrow();
    });
  });
});
