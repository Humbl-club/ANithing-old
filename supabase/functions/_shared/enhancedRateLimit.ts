import { Ratelimit } from "https://deno.land/x/upstash_ratelimit@v0.4.4/mod.ts";
import { Redis } from "https://deno.land/x/upstash_redis@v1.22.1/mod.ts";

const redis = new Redis({
  url: Deno.env.get('UPSTASH_REDIS_URL')!,
  token: Deno.env.get('UPSTASH_REDIS_TOKEN')!,
});

// Enhanced rate limiting for 10k concurrent users
export const rateLimiter = {
  // General API calls - increased for high traffic
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(500, "1 h"), // 500 requests per hour per user
    analytics: true,
    prefix: "api_limit",
  }),
  
  // Search queries - more generous for better UX
  search: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(120, "1 m"), // 2 searches per second
    analytics: true,
    prefix: "search_limit",
  }),
  
  // AI/ML features - conservative
  ai: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, "1 h"), // Increased for recommendations
    analytics: true,
    prefix: "ai_limit",
  }),
  
  // Authentication - stricter for security
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "5 m"), // 10 login attempts per 5 minutes
    analytics: true,
    prefix: "auth_limit",
  }),
  
  // Database writes - prevent spam
  write: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 h"), // 100 writes per hour
    analytics: true,
    prefix: "write_limit",
  }),
  
  // Home page data - very generous for performance
  home: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(300, "1 h"), // Frequent home page access
    analytics: true,
    prefix: "home_limit",
  }),
  
  // Content details - generous for browsing
  content: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(200, "1 h"),
    analytics: true,
    prefix: "content_limit",
  }),
  
  // Global rate limit per IP for DDoS protection
  global: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1000, "1 h"), // 1000 requests per hour per IP
    analytics: true,
    prefix: "global_limit",
  }),
  
  // Burst protection - very short term
  burst: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests per 10 seconds
    analytics: true,
    prefix: "burst_limit",
  })
};

// Enhanced rate limit checker with multiple strategies
export async function checkRateLimit(
  identifier: string,
  limiter: keyof typeof rateLimiter,
  options: {
    skipGlobal?: boolean;
    skipBurst?: boolean;
    customKey?: string;
  } = {}
) {
  const results = [];
  
  // Check burst protection first (most restrictive)
  if (!options.skipBurst) {
    const burstResult = await rateLimiter.burst.limit(identifier);
    results.push({ type: 'burst', ...burstResult });
    
    if (!burstResult.success) {
      return {
        success: false,
        type: 'burst',
        headers: {
          'X-RateLimit-Type': 'burst',
          'X-RateLimit-Limit': burstResult.limit.toString(),
          'X-RateLimit-Remaining': burstResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(burstResult.reset).toISOString(),
          'Retry-After': Math.ceil((burstResult.reset - Date.now()) / 1000).toString(),
        },
      };
    }
  }
  
  // Check specific limiter
  const mainResult = await rateLimiter[limiter].limit(
    options.customKey || identifier
  );
  results.push({ type: limiter, ...mainResult });
  
  if (!mainResult.success) {
    return {
      success: false,
      type: limiter,
      headers: {
        'X-RateLimit-Type': limiter,
        'X-RateLimit-Limit': mainResult.limit.toString(),
        'X-RateLimit-Remaining': mainResult.remaining.toString(),
        'X-RateLimit-Reset': new Date(mainResult.reset).toISOString(),
        'Retry-After': Math.ceil((mainResult.reset - Date.now()) / 1000).toString(),
      },
    };
  }
  
  // Check global limit (IP-based)
  if (!options.skipGlobal) {
    const globalResult = await rateLimiter.global.limit(identifier);
    results.push({ type: 'global', ...globalResult });
    
    if (!globalResult.success) {
      return {
        success: false,
        type: 'global',
        headers: {
          'X-RateLimit-Type': 'global',
          'X-RateLimit-Limit': globalResult.limit.toString(),
          'X-RateLimit-Remaining': globalResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(globalResult.reset).toISOString(),
          'Retry-After': Math.ceil((globalResult.reset - Date.now()) / 1000).toString(),
        },
      };
    }
  }
  
  // All checks passed
  return {
    success: true,
    headers: {
      'X-RateLimit-Type': limiter,
      'X-RateLimit-Limit': mainResult.limit.toString(),
      'X-RateLimit-Remaining': mainResult.remaining.toString(),
      'X-RateLimit-Reset': new Date(mainResult.reset).toISOString(),
    },
  };
}

// Advanced rate limiting with user tiers
export async function checkTieredRateLimit(
  identifier: string,
  userTier: 'free' | 'premium' | 'pro' = 'free',
  endpoint: string
) {
  const multipliers = {
    free: 1,
    premium: 2,
    pro: 5
  };
  
  const baseLimit = getBaseLimitForEndpoint(endpoint);
  const adjustedLimit = baseLimit * multipliers[userTier];
  
  // Create dynamic rate limiter for this user tier
  const tierLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(adjustedLimit, "1 h"),
    analytics: true,
    prefix: `tier_${userTier}_${endpoint}`,
  });
  
  const result = await tierLimiter.limit(identifier);
  
  return {
    success: result.success,
    tier: userTier,
    adjustedLimit,
    headers: {
      'X-RateLimit-Tier': userTier,
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': new Date(result.reset).toISOString(),
    },
  };
}

// Helper function to get base limits for different endpoints
function getBaseLimitForEndpoint(endpoint: string): number {
  const limits: Record<string, number> = {
    'home': 300,
    'search': 120,
    'content': 200,
    'api': 500,
    'auth': 10,
    'write': 100,
    'ai': 50
  };
  
  return limits[endpoint] || 100;
}

// Intelligent rate limiting that adapts to system load
export async function adaptiveRateLimit(
  identifier: string,
  endpoint: string,
  systemLoad: number = 0.5 // 0.0 to 1.0
) {
  const baseLimit = getBaseLimitForEndpoint(endpoint);
  
  // Reduce limits when system is under high load
  const loadAdjustment = Math.max(0.1, 1 - systemLoad);
  const adjustedLimit = Math.floor(baseLimit * loadAdjustment);
  
  const adaptiveLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(adjustedLimit, "1 h"),
    analytics: true,
    prefix: `adaptive_${endpoint}_${Math.floor(systemLoad * 10)}`,
  });
  
  const result = await adaptiveLimiter.limit(identifier);
  
  return {
    success: result.success,
    systemLoad,
    adjustedLimit,
    baseLimit,
    headers: {
      'X-RateLimit-Adaptive': 'true',
      'X-RateLimit-Load': systemLoad.toString(),
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': new Date(result.reset).toISOString(),
    },
  };
}

// Rate limit bypass for trusted sources
export function shouldBypassRateLimit(request: Request): boolean {
  const trustedIPs = [
    '127.0.0.1',
    '::1',
    // Add your server IPs, monitoring services, etc.
  ];
  
  const trustedUserAgents = [
    'HealthCheck',
    'UptimeRobot',
    'Pingdom'
  ];
  
  const ip = request.headers.get('x-forwarded-for') || 
            request.headers.get('x-real-ip') || 
            'unknown';
  
  const userAgent = request.headers.get('user-agent') || '';
  
  return trustedIPs.includes(ip) || 
         trustedUserAgents.some(agent => userAgent.includes(agent));
}

// Circuit breaker pattern for system protection
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private failureThreshold = 5,
    private recoveryTimeout = 60000, // 1 minute
    private redis = redis
  ) {}
  
  async execute<T>(
    key: string,
    operation: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    const state = await this.getState(key);
    
    if (state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        await this.setState(key, 'HALF_OPEN');
      } else {
        if (fallback) {
          return fallback();
        }
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await operation();
      await this.onSuccess(key);
      return result;
    } catch (error) {
      await this.onFailure(key);
      if (fallback) {
        return fallback();
      }
      throw error;
    }
  }
  
  private async getState(key: string): Promise<'CLOSED' | 'OPEN' | 'HALF_OPEN'> {
    const data = await this.redis.get(`circuit:${key}`);
    if (!data) return 'CLOSED';
    
    const parsed = JSON.parse(data as string);
    this.failures = parsed.failures;
    this.lastFailureTime = parsed.lastFailureTime;
    this.state = parsed.state;
    
    return this.state;
  }
  
  private async setState(key: string, state: 'CLOSED' | 'OPEN' | 'HALF_OPEN') {
    this.state = state;
    await this.redis.setex(
      `circuit:${key}`,
      300, // 5 minutes TTL
      JSON.stringify({
        state: this.state,
        failures: this.failures,
        lastFailureTime: this.lastFailureTime
      })
    );
  }
  
  private async onSuccess(key: string) {
    this.failures = 0;
    await this.setState(key, 'CLOSED');
  }
  
  private async onFailure(key: string) {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.failureThreshold) {
      await this.setState(key, 'OPEN');
    }
  }
}