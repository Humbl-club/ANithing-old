/**
 * Rate Limiting and DDoS Protection Middleware
 * Protects against abuse and ensures fair usage for 10k+ users
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
  lastRequest: number;
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (request: Request) => string;
  onLimitReached?: (key: string) => void;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private configs = new Map<string, RateLimitConfig>();
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startCleanup();
  }

  /**
   * Create a rate limit rule
   */
  createRule(name: string, config: RateLimitConfig): void {
    this.configs.set(name, {
      windowMs: 60 * 1000, // 1 minute default
      maxRequests: 100, // 100 requests per minute default
      keyGenerator: (req) => this.getClientKey(req),
      ...config
    });
  }

  /**
   * Check if request should be rate limited
   */
  async checkLimit(ruleName: string, request: Request): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    totalHits: number;
  }> {
    const config = this.configs.get(ruleName);
    if (!config) {
      throw new Error(`Rate limit rule '${ruleName}' not found`);
    }

    const key = `${ruleName}:${config.keyGenerator!(request)}`;
    const now = Date.now();
    const entry = this.store.get(key) || {
      count: 0,
      resetTime: now + config.windowMs,
      lastRequest: now
    };

    // Reset window if expired
    if (now >= entry.resetTime) {
      entry.count = 0;
      entry.resetTime = now + config.windowMs;
    }

    // Increment counter
    entry.count++;
    entry.lastRequest = now;
    this.store.set(key, entry);

    const allowed = entry.count <= config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - entry.count);

    if (!allowed && config.onLimitReached) {
      config.onLimitReached(key);
    }

    return {
      allowed,
      remaining,
      resetTime: entry.resetTime,
      totalHits: entry.count
    };
  }

  /**
   * Middleware function for fetch requests
   */
  createMiddleware(ruleName: string) {
    return async (request: Request): Promise<Response | null> => {
      try {
        const result = await this.checkLimit(ruleName, request);
        
        if (!result.allowed) {
          return new Response(
            JSON.stringify({
              error: 'Rate limit exceeded',
              message: `Too many requests. Try again after ${new Date(result.resetTime).toISOString()}`,
              retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
            }),
            {
              status: 429,
              headers: {
                'Content-Type': 'application/json',
                'X-RateLimit-Limit': this.configs.get(ruleName)?.maxRequests.toString() || '100',
                'X-RateLimit-Remaining': result.remaining.toString(),
                'X-RateLimit-Reset': result.resetTime.toString(),
                'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
              }
            }
          );
        }

        return null; // Allow request to proceed
      } catch (error) {
        console.error('Rate limiter error:', error);
        return null; // Allow request to proceed on error
      }
    };
  }

  /**
   * Get client identifier from request
   */
  private getClientKey(request: Request): string {
    // Try to get real IP from headers (when behind proxy/CDN)
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cloudflareIp = request.headers.get('cf-connecting-ip');
    
    const ip = cloudflareIp || realIp || forwarded?.split(',')[0] || 'unknown';
    
    // Include user agent for better identification
    const userAgent = request.headers.get('user-agent') || '';
    const userAgentHash = this.simpleHash(userAgent);
    
    return `${ip}:${userAgentHash}`;
  }

  /**
   * Simple hash function for user agent
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Get rate limit statistics
   */
  getStats() {
    const now = Date.now();
    const activeEntries = Array.from(this.store.entries())
      .filter(([_, entry]) => entry.resetTime > now);

    const stats = {
      totalRules: this.configs.size,
      activeClients: activeEntries.length,
      totalRequests: activeEntries.reduce((sum, [_, entry]) => sum + entry.count, 0),
      rateLimitedClients: activeEntries.filter(([_, entry]) => {
        const ruleName = entry.lastRequest ? Object.keys(Object.fromEntries(this.configs))[0] : '';
        const config = this.configs.get(ruleName);
        return config && entry.count > config.maxRequests;
      }).length
    };

    return stats;
  }

  /**
   * Clean up expired entries
   */
  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.resetTime + 60000) { // Keep for 1 minute after reset
        this.store.delete(key);
      }
    }
  }

  /**
   * Start periodic cleanup
   */
  private startCleanup() {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, 60000); // Clean every minute
  }

  /**
   * Destroy rate limiter
   */
  destroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.store.clear();
    this.configs.clear();
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

// Default rate limit configurations for different endpoints
export const setupDefaultRules = () => {
  // General API rate limiting
  rateLimiter.createRule('api-general', {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
    onLimitReached: (key) => console.warn(`Rate limit exceeded for ${key}`)
  });

  // Search endpoint (more restrictive)
  rateLimiter.createRule('api-search', {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 searches per minute
    onLimitReached: (key) => console.warn(`Search rate limit exceeded for ${key}`)
  });

  // Authentication endpoints (very restrictive)
  rateLimiter.createRule('api-auth', {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    onLimitReached: (key) => console.warn(`Auth rate limit exceeded for ${key}`)
  });

  // Image/asset requests (more lenient)
  rateLimiter.createRule('api-assets', {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 200, // 200 requests per minute
    onLimitReached: (key) => console.warn(`Asset rate limit exceeded for ${key}`)
  });

  // Heavy operations (data import/export)
  rateLimiter.createRule('api-heavy', {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 requests per hour
    onLimitReached: (key) => console.warn(`Heavy operation rate limit exceeded for ${key}`)
  });
};

/**
 * DDoS protection middleware
 */
export class DDoSProtection {
  private suspiciousIPs = new Map<string, {
    requests: number;
    lastSeen: number;
    blocked: boolean;
    blockUntil: number;
  }>();

  /**
   * Check for DDoS patterns
   */
  checkForDDoS(request: Request): { blocked: boolean; reason?: string } {
    const ip = this.getClientIP(request);
    const now = Date.now();
    
    const entry = this.suspiciousIPs.get(ip) || {
      requests: 0,
      lastSeen: now,
      blocked: false,
      blockUntil: 0
    };

    // Check if IP is currently blocked
    if (entry.blocked && now < entry.blockUntil) {
      return { blocked: true, reason: 'IP temporarily blocked due to suspicious activity' };
    }

    // Reset block if expired
    if (entry.blocked && now >= entry.blockUntil) {
      entry.blocked = false;
      entry.requests = 0;
    }

    // Count requests in last minute
    if (now - entry.lastSeen < 60000) {
      entry.requests++;
    } else {
      entry.requests = 1;
    }

    entry.lastSeen = now;

    // Block if too many requests (potential DDoS)
    if (entry.requests > 500) { // 500 requests per minute is suspicious
      entry.blocked = true;
      entry.blockUntil = now + (15 * 60 * 1000); // Block for 15 minutes
      console.warn(`IP ${ip} blocked for potential DDoS attack (${entry.requests} requests/min)`);
      return { blocked: true, reason: 'Too many requests - potential DDoS detected' };
    }

    this.suspiciousIPs.set(ip, entry);
    return { blocked: false };
  }

  private getClientIP(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cloudflareIp = request.headers.get('cf-connecting-ip');
    
    return cloudflareIp || realIp || forwarded?.split(',')[0] || 'unknown';
  }
}

export const ddosProtection = new DDoSProtection();

/**
 * Enhanced fetch wrapper with rate limiting and monitoring
 */
export const enhancedFetch = async (
  url: string,
  options: RequestInit & { rateLimitRule?: string } = {}
): Promise<Response> => {
  const { rateLimitRule = 'api-general', ...fetchOptions } = options;
  
  // Create request object for rate limiting
  const request = new Request(url, fetchOptions);
  
  // Check DDoS protection
  const ddosCheck = ddosProtection.checkForDDoS(request);
  if (ddosCheck.blocked) {
    throw new Error(`Request blocked: ${ddosCheck.reason}`);
  }
  
  // Check rate limits
  const rateLimitResponse = await rateLimiter.createMiddleware(rateLimitRule)(request);
  if (rateLimitResponse) {
    throw new Error(`Rate limit exceeded: ${rateLimitResponse.statusText}`);
  }
  
  // Proceed with actual request
  const start = performance.now();
  try {
    const response = await fetch(url, fetchOptions);
    const duration = performance.now() - start;
    
    // Log slow requests
    if (duration > 3000) {
      console.warn(`Slow API request: ${url} took ${duration}ms`);
    }
    
    return response;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`API request failed: ${url} (${duration}ms)`, error);
    throw error;
  }
};

// Initialize default rules
setupDefaultRules();