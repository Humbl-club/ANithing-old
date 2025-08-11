/**
 * CDN Configuration for 10k Concurrent Users
 * Optimizes static asset delivery through multiple CDN strategies
 */

// CDN Provider Configurations
const CDN_CONFIGS = {
  // Primary CDN - Cloudflare (recommended for global coverage)
  cloudflare: {
    baseUrl: process.env.CLOUDFLARE_CDN_URL || '',
    zoneId: process.env.CLOUDFLARE_ZONE_ID || '',
    apiToken: process.env.CLOUDFLARE_API_TOKEN || '',
    settings: {
      caching: {
        // Aggressive caching for static assets
        rules: [
          {
            pattern: '*.{js,css,woff2,woff}',
            ttl: 31536000, // 1 year
            browserTtl: 31536000,
            edgeTtl: 31536000
          },
          {
            pattern: '*.{png,jpg,jpeg,webp,svg,gif,avif}',
            ttl: 2592000, // 30 days
            browserTtl: 2592000,
            edgeTtl: 7776000 // 90 days at edge
          },
          {
            pattern: '*.html',
            ttl: 3600, // 1 hour
            browserTtl: 0, // No browser caching for HTML
            edgeTtl: 3600
          },
          {
            pattern: '/api/*',
            ttl: 300, // 5 minutes
            browserTtl: 0,
            edgeTtl: 300
          }
        ]
      },
      compression: {
        brotli: true,
        gzip: true,
        minify: {
          html: true,
          css: true,
          js: true
        }
      },
      optimization: {
        // Image optimization at edge
        polish: 'lossy', // Automatic image optimization
        webp: true, // Auto WebP conversion
        avif: true, // Auto AVIF conversion when supported
        // Mirage for mobile optimization
        mirage: true,
        // Rocket Loader for JS optimization
        rocketLoader: false, // Disable for React apps
        // Auto minify
        autoMinify: {
          html: true,
          css: true,
          js: true
        }
      },
      performance: {
        // HTTP/3 and 0-RTT
        http3: true,
        zeroRtt: true,
        // Early hints
        earlyHints: true,
        // Prefetch links
        prefetchPreload: true
      },
      security: {
        // Basic security headers
        hsts: true,
        // Bot fighting
        botFightMode: true,
        // DDoS protection
        ddosProtection: 'high',
        // Rate limiting for API endpoints
        rateLimiting: {
          '/api/*': {
            requests: 100,
            period: 60, // 100 requests per minute
            action: 'challenge'
          }
        }
      }
    }
  },

  // Secondary CDN - AWS CloudFront
  cloudfront: {
    distributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID || '',
    region: process.env.AWS_REGION || 'us-east-1',
    settings: {
      caching: {
        behaviors: [
          {
            pathPattern: '/assets/*',
            ttl: 31536000, // 1 year
            compress: true,
            viewerProtocolPolicy: 'redirect-to-https',
            cachePolicy: 'CachingOptimized',
            originRequestPolicy: 'UserAgentRefererHeaders'
          },
          {
            pathPattern: '/api/*',
            ttl: 300, // 5 minutes
            compress: true,
            cachePolicy: 'CachingDisabled',
            originRequestPolicy: 'AllViewerExceptHostHeader'
          }
        ]
      },
      origins: {
        primary: {
          domainName: process.env.ORIGIN_DOMAIN || '',
          customOriginConfig: {
            httpPort: 443,
            httpsPort: 443,
            originProtocolPolicy: 'https-only',
            originSslProtocols: ['TLSv1.2']
          }
        }
      }
    }
  },

  // Tertiary CDN - Fastly (for advanced edge computing)
  fastly: {
    serviceId: process.env.FASTLY_SERVICE_ID || '',
    apiToken: process.env.FASTLY_API_TOKEN || '',
    settings: {
      // Edge computing capabilities
      vclSnippets: {
        // Custom VCL for advanced caching logic
        recv: `
          # Normalize query strings for better caching
          if (req.url ~ "\\?") {
            set req.url = querystring.sort(req.url);
          }
          
          # Add geo headers for personalization
          set req.http.X-Country = geoip.country_code;
          set req.http.X-Region = geoip.region;
          
          # Bot detection
          if (req.http.User-Agent ~ "bot|crawler|spider") {
            set req.http.X-Bot = "1";
          }
        `,
        deliver: `
          # Add performance headers
          set resp.http.X-Cache = if(obj.hits > 0, "HIT", "MISS");
          set resp.http.X-Cache-Age = obj.age;
          
          # Security headers
          set resp.http.X-Content-Type-Options = "nosniff";
          set resp.http.X-Frame-Options = "DENY";
          set resp.http.X-XSS-Protection = "1; mode=block";
          
          # Performance headers
          set resp.http.Server-Timing = "cdn;dur=" + time.elapsed.msec;
        `
      }
    }
  }
};

// Asset optimization configurations
const ASSET_OPTIMIZATION = {
  images: {
    formats: ['avif', 'webp', 'jpg'],
    qualities: {
      high: 85,
      medium: 75,
      low: 60
    },
    sizes: [
      { width: 320, suffix: '_mobile' },
      { width: 768, suffix: '_tablet' },
      { width: 1200, suffix: '_desktop' },
      { width: 1920, suffix: '_hd' }
    ],
    lazy: true,
    placeholder: 'blur'
  },
  
  videos: {
    formats: ['webm', 'mp4'],
    qualities: ['480p', '720p', '1080p'],
    streaming: {
      hls: true,
      dash: true
    }
  },
  
  fonts: {
    formats: ['woff2', 'woff'],
    preload: ['primary', 'heading'],
    display: 'swap',
    subset: 'latin'
  }
};

// Performance budgets for monitoring
const PERFORMANCE_BUDGETS = {
  // Bundle size limits
  bundles: {
    'react-core': 45, // KB
    'ui-core': 25,
    'pages-critical': 30,
    'vendor-misc': 50
  },
  
  // Resource hints
  preload: [
    '/assets/fonts/primary.woff2',
    '/assets/css/critical.css'
  ],
  
  prefetch: [
    '/assets/js/features-content.js',
    '/assets/js/features-search.js'
  ],
  
  // Image optimization targets
  images: {
    maxSize: 100, // KB
    formats: ['avif', 'webp'],
    compression: 0.8
  },
  
  // Core Web Vitals targets
  metrics: {
    lcp: 2.5, // seconds
    fid: 100, // milliseconds
    cls: 0.1, // score
    ttfb: 0.8 // seconds
  }
};

// CDN deployment configuration
const DEPLOYMENT = {
  // Multi-region deployment
  regions: [
    'us-east-1', 'us-west-2', // Americas
    'eu-west-1', 'eu-central-1', // Europe
    'ap-southeast-1', 'ap-northeast-1' // Asia Pacific
  ],
  
  // Edge locations priority
  edgeLocations: {
    tier1: ['US', 'EU', 'JP', 'SG'],
    tier2: ['CA', 'AU', 'IN', 'BR'],
    tier3: ['KR', 'HK', 'TW', 'TH']
  },
  
  // Failover strategy
  failover: {
    primary: 'cloudflare',
    secondary: 'cloudfront',
    tertiary: 'fastly',
    healthCheck: {
      interval: 30, // seconds
      timeout: 5,
      unhealthyThreshold: 3
    }
  }
};

// Export configurations
module.exports = {
  CDN_CONFIGS,
  ASSET_OPTIMIZATION,
  PERFORMANCE_BUDGETS,
  DEPLOYMENT
};

// Helper functions for CDN management
class CDNManager {
  constructor(config = CDN_CONFIGS.cloudflare) {
    this.config = config;
  }
  
  async purgeCache(urls = []) {
    if (urls.length === 0) {
      // Purge all
      urls = ['/*'];
    }
    
    console.log(`Purging CDN cache for: ${urls.join(', ')}`);
    // Implementation depends on CDN provider
    return true;
  }
  
  async warmCache(urls) {
    console.log(`Warming CDN cache for: ${urls.join(', ')}`);
    // Pre-fetch critical URLs to edge locations
    const promises = urls.map(url => fetch(url, { method: 'HEAD' }));
    await Promise.allSettled(promises);
    return true;
  }
  
  async getPerformanceMetrics() {
    return {
      hitRatio: 0.95,
      avgResponseTime: 45, // ms
      bandwidthUsage: '1.2TB',
      requestCount: 1500000,
      topUrls: ['/assets/js/react-core.js', '/assets/css/main.css']
    };
  }
  
  generateOptimizedUrl(originalUrl, options = {}) {
    const { format, quality, width, height } = options;
    
    // Generate CDN-optimized URL based on file type
    if (originalUrl.match(/\.(jpg|jpeg|png|webp)$/)) {
      const params = new URLSearchParams();
      if (format) params.append('format', format);
      if (quality) params.append('quality', quality.toString());
      if (width) params.append('width', width.toString());
      if (height) params.append('height', height.toString());
      
      const queryString = params.toString();
      return `${this.config.baseUrl}${originalUrl}${queryString ? '?' + queryString : ''}`;
    }
    
    return `${this.config.baseUrl}${originalUrl}`;
  }
}

// Export CDN manager
module.exports.CDNManager = CDNManager;