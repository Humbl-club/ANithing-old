/**
 * Simple, efficient security utilities
 * Minimal complexity, maximum effectiveness
*/

// Basic XSS prevention
export const sanitizeString = (input: string): string => {
  return input
    .trim()
    .replace(/[<>&"']/g, (char) => ({
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&#x27;'
    }[char] || char));
};

// SQL injection protection for LIKE queries
export const escapeLikeQuery = (input: string): string => {
  return input.replace(/[%_\\]/g, '\\$&');
};

// Simple email validation
export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
};

// Basic rate limiter
export class SimpleRateLimit {
  private requests = new Map<string, number[]>();
  
  constructor(private maxRequests = 60, private windowMs = 60000) {}
  
  isAllowed(key: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];
    const validRequests = userRequests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) return false;
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }
}

export const rateLimiter = new SimpleRateLimit();
export const authRateLimiter = new SimpleRateLimit(5, 300000); // 5 per 5 minutes