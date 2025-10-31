import { encryptApiKey, decryptApiKey, generateUserSecret } from "./crypto";

describe("Crypto Service", () => {
  const testApiKey = "test-api-key-12345";
  const testUserSecret = "user-secret-abcdef";
  const testUserId = "user-123";
  const testSessionId = "session-456";
  const testEncryptionSecret = "app-secret-xyz";

  describe("encryptApiKey", () => {
    it("should encrypt an API key and return all required fields", () => {
      const result = encryptApiKey(testApiKey, testUserSecret);

      expect(result).toHaveProperty("encryptedValue");
      expect(result).toHaveProperty("salt");
      expect(result).toHaveProperty("iv");
      expect(result).toHaveProperty("authTag");

      // All values should be base64 strings
      expect(typeof result.encryptedValue).toBe("string");
      expect(typeof result.salt).toBe("string");
      expect(typeof result.iv).toBe("string");
      expect(typeof result.authTag).toBe("string");

      // Values should be non-empty
      expect(result.encryptedValue.length).toBeGreaterThan(0);
      expect(result.salt.length).toBeGreaterThan(0);
      expect(result.iv.length).toBeGreaterThan(0);
      expect(result.authTag.length).toBeGreaterThan(0);
    });

    it("should produce different encrypted values for the same input", () => {
      const result1 = encryptApiKey(testApiKey, testUserSecret);
      const result2 = encryptApiKey(testApiKey, testUserSecret);

      // Due to random salt and IV, encrypted values should differ
      expect(result1.encryptedValue).not.toBe(result2.encryptedValue);
      expect(result1.salt).not.toBe(result2.salt);
      expect(result1.iv).not.toBe(result2.iv);
    });

    it("should handle empty strings", () => {
      const result = encryptApiKey("", testUserSecret);
      expect(result).toHaveProperty("encryptedValue");
      // Empty string encrypted will still produce a value (just the padding/metadata)
      expect(typeof result.encryptedValue).toBe("string");
    });

    it("should handle special characters", () => {
      const specialApiKey = "!@#$%^&*()_+-=[]{}|;':\",./<>?`~";
      const result = encryptApiKey(specialApiKey, testUserSecret);
      expect(result).toHaveProperty("encryptedValue");
      expect(result.encryptedValue).toBeTruthy();
    });

    it("should handle unicode characters", () => {
      const unicodeApiKey = "🔐 API Key with émojis and spéciål çhars";
      const result = encryptApiKey(unicodeApiKey, testUserSecret);
      expect(result).toHaveProperty("encryptedValue");
      expect(result.encryptedValue).toBeTruthy();
    });
  });

  describe("decryptApiKey", () => {
    it("should decrypt an encrypted API key correctly", () => {
      const encrypted = encryptApiKey(testApiKey, testUserSecret);
      const decrypted = decryptApiKey(encrypted, testUserSecret);

      expect(decrypted).toBe(testApiKey);
    });

    it("should fail with wrong user secret", () => {
      const encrypted = encryptApiKey(testApiKey, testUserSecret);

      expect(() => {
        decryptApiKey(encrypted, "wrong-secret");
      }).toThrow();
    });

    it("should fail with tampered auth tag", () => {
      const encrypted = encryptApiKey(testApiKey, testUserSecret);
      const tampered = {
        ...encrypted,
        authTag: Buffer.from("tampered").toString("base64"),
      };

      expect(() => {
        decryptApiKey(tampered, testUserSecret);
      }).toThrow();
    });

    it("should fail with tampered encrypted value", () => {
      const encrypted = encryptApiKey(testApiKey, testUserSecret);
      const tampered = {
        ...encrypted,
        encryptedValue: Buffer.from("tampered").toString("base64"),
      };

      expect(() => {
        decryptApiKey(tampered, testUserSecret);
      }).toThrow();
    });

    it("should handle empty string encryption/decryption", () => {
      const encrypted = encryptApiKey("", testUserSecret);
      const decrypted = decryptApiKey(encrypted, testUserSecret);
      expect(decrypted).toBe("");
    });

    it("should handle special characters round-trip", () => {
      const specialApiKey = "!@#$%^&*()_+-=[]{}|;':\",./<>?`~";
      const encrypted = encryptApiKey(specialApiKey, testUserSecret);
      const decrypted = decryptApiKey(encrypted, testUserSecret);
      expect(decrypted).toBe(specialApiKey);
    });

    it("should handle unicode characters round-trip", () => {
      const unicodeApiKey = "🔐 API Key with émojis and spéciål çhars";
      const encrypted = encryptApiKey(unicodeApiKey, testUserSecret);
      const decrypted = decryptApiKey(encrypted, testUserSecret);
      expect(decrypted).toBe(unicodeApiKey);
    });
  });

  describe("generateUserSecret", () => {
    it("should generate a deterministic secret for same inputs", () => {
      const secret1 = generateUserSecret(
        testUserId,
        testSessionId,
        testEncryptionSecret,
      );
      const secret2 = generateUserSecret(
        testUserId,
        testSessionId,
        testEncryptionSecret,
      );

      expect(secret1).toBe(secret2);
    });

    it("should generate different secrets for different users", () => {
      const secret1 = generateUserSecret(
        "user-1",
        testSessionId,
        testEncryptionSecret,
      );
      const secret2 = generateUserSecret(
        "user-2",
        testSessionId,
        testEncryptionSecret,
      );

      expect(secret1).not.toBe(secret2);
    });

    it("should generate different secrets for different sessions", () => {
      const secret1 = generateUserSecret(
        testUserId,
        "session-1",
        testEncryptionSecret,
      );
      const secret2 = generateUserSecret(
        testUserId,
        "session-2",
        testEncryptionSecret,
      );

      expect(secret1).not.toBe(secret2);
    });

    it("should generate different secrets for different app secrets", () => {
      const secret1 = generateUserSecret(
        testUserId,
        testSessionId,
        "app-secret-1",
      );
      const secret2 = generateUserSecret(
        testUserId,
        testSessionId,
        "app-secret-2",
      );

      expect(secret1).not.toBe(secret2);
    });

    it("should return a base64 string", () => {
      const secret = generateUserSecret(
        testUserId,
        testSessionId,
        testEncryptionSecret,
      );

      // Should be a valid base64 string
      expect(typeof secret).toBe("string");
      expect(() => Buffer.from(secret, "base64")).not.toThrow();
    });
  });

  describe("Integration tests", () => {
    it("should encrypt and decrypt with generated user secret", () => {
      const userSecret = generateUserSecret(
        testUserId,
        testSessionId,
        testEncryptionSecret,
      );
      const apiKey = "my-trading-212-api-key";

      const encrypted = encryptApiKey(apiKey, userSecret);
      const decrypted = decryptApiKey(encrypted, userSecret);

      expect(decrypted).toBe(apiKey);
    });

    it("should not decrypt with different user session", () => {
      const userSecret1 = generateUserSecret(
        "user-1",
        "session-1",
        testEncryptionSecret,
      );
      const userSecret2 = generateUserSecret(
        "user-2",
        "session-2",
        testEncryptionSecret,
      );

      const encrypted = encryptApiKey(testApiKey, userSecret1);

      expect(() => {
        decryptApiKey(encrypted, userSecret2);
      }).toThrow();
    });
  });

  describe("Error cases", () => {
    it("should handle invalid base64 in decrypt", () => {
      const invalidData = {
        encryptedValue: "not-valid-base64!!!",
        salt: "also-invalid!!!",
        iv: "invalid!!!",
        authTag: "invalid!!!",
      };

      expect(() => {
        decryptApiKey(invalidData, testUserSecret);
      }).toThrow();
    });

    it("should handle missing fields in decrypt", () => {
      const incompleteData = {
        encryptedValue: "test",
        // Missing other fields
      } as Parameters<typeof decryptApiKey>[0];

      expect(() => {
        decryptApiKey(incompleteData, testUserSecret);
      }).toThrow();
    });
  });
});
