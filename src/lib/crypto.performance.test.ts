import { encryptApiKey, decryptApiKey, generateUserSecret } from "./crypto";

describe("Crypto Service Performance", () => {
  const testApiKey =
    "test-api-key-12345-with-some-extra-length-for-realistic-testing";
  const testUserSecret = generateUserSecret(
    "user-123",
    "session-456",
    "app-secret",
  );

  describe("Encryption performance", () => {
    it("should encrypt within reasonable time (< 50ms)", () => {
      const iterations = 100;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        encryptApiKey(testApiKey, testUserSecret);
      }

      const end = performance.now();
      const avgTime = (end - start) / iterations;

      console.log(`Average encryption time: ${avgTime.toFixed(2)}ms`);
      expect(avgTime).toBeLessThan(50); // Should be fast enough for API use
    });

    it("should handle large API keys efficiently", () => {
      // Simulate a large JWT token or similar
      const largeApiKey = "x".repeat(4096);
      const start = performance.now();

      const result = encryptApiKey(largeApiKey, testUserSecret);

      const end = performance.now();
      const time = end - start;

      console.log(`Large key encryption time: ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(100);
      expect(result.encryptedValue).toBeTruthy();
    });
  });

  describe("Decryption performance", () => {
    it("should decrypt within reasonable time (< 50ms)", () => {
      const encrypted = encryptApiKey(testApiKey, testUserSecret);
      const iterations = 100;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        decryptApiKey(encrypted, testUserSecret);
      }

      const end = performance.now();
      const avgTime = (end - start) / iterations;

      console.log(`Average decryption time: ${avgTime.toFixed(2)}ms`);
      expect(avgTime).toBeLessThan(50);
    });
  });

  describe("Key derivation performance", () => {
    it("should generate user secrets quickly (< 10ms)", () => {
      const iterations = 100;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        generateUserSecret(`user-${i}`, `session-${i}`, "app-secret");
      }

      const end = performance.now();
      const avgTime = (end - start) / iterations;

      console.log(`Average key generation time: ${avgTime.toFixed(2)}ms`);
      expect(avgTime).toBeLessThan(10);
    });
  });

  describe("Round-trip performance", () => {
    it("should complete encrypt-decrypt cycle efficiently", () => {
      const iterations = 50;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        const encrypted = encryptApiKey(testApiKey, testUserSecret);
        decryptApiKey(encrypted, testUserSecret);
      }

      const end = performance.now();
      const avgTime = (end - start) / iterations;

      console.log(`Average round-trip time: ${avgTime.toFixed(2)}ms`);
      expect(avgTime).toBeLessThan(100); // Both operations combined
    });
  });

  describe("Memory efficiency", () => {
    it("should not leak memory during repeated operations", () => {
      const initialMemory = process.memoryUsage().heapUsed;
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        const encrypted = encryptApiKey(testApiKey, testUserSecret);
        decryptApiKey(encrypted, testUserSecret);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      const memoryPerOperation = memoryIncrease / iterations;

      console.log(
        `Memory per operation: ${memoryPerOperation.toFixed(0)} bytes`,
      );

      // Should not increase by more than 10KB per operation on average
      // Node.js crypto operations can allocate temporary buffers
      expect(memoryPerOperation).toBeLessThan(10240);
    });
  });
});
