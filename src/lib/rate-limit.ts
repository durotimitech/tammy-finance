interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private storage: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startCleanup();
  }

  private startCleanup() {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.storage.entries()) {
        if (entry.resetAt < now) {
          this.storage.delete(key);
        }
      }
    }, 60000);
  }

  public async limit(
    identifier: string,
    maxRequests: number,
    windowMs: number,
  ): Promise<{
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
  }> {
    const now = Date.now();
    const key = identifier;
    const entry = this.storage.get(key);

    if (!entry || entry.resetAt < now) {
      const resetAt = now + windowMs;
      this.storage.set(key, { count: 1, resetAt });

      return {
        success: true,
        limit: maxRequests,
        remaining: maxRequests - 1,
        reset: resetAt,
      };
    }

    if (entry.count >= maxRequests) {
      return {
        success: false,
        limit: maxRequests,
        remaining: 0,
        reset: entry.resetAt,
      };
    }

    entry.count++;
    this.storage.set(key, entry);

    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - entry.count,
      reset: entry.resetAt,
    };
  }

  public cleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.storage.clear();
  }
}

const rateLimiter = new RateLimiter();

export const ratelimit = {
  auth: (ip: string) => rateLimiter.limit(`auth:${ip}`, 5, 15 * 60 * 1000),
  api: (ip: string) => rateLimiter.limit(`api:${ip}`, 100, 60 * 1000),
  expensive: (ip: string) => rateLimiter.limit(`expensive:${ip}`, 10, 60 * 1000),
};
