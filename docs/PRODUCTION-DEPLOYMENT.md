# 🚀 Production Deployment Guide

This guide provides comprehensive instructions for deploying AniThing to production with optimal performance and scalability.

## 📋 Prerequisites

### Required
- Node.js 18+ 
- npm or yarn
- Git
- Supabase project (production instance)

### Optional
- Docker (for containerized deployment)
- CDN service (Cloudflare, AWS CloudFront, etc.)
- Monitoring tools (Sentry, DataDog, etc.)

## 🏗️ Build Configuration

### Environment Setup

1. **Copy environment template**:
   ```bash
   cp .env.production.example .env.production
   ```

2. **Configure required variables**:
   ```bash
   # === REQUIRED SUPABASE CONFIGURATION ===
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   
   # === APPLICATION SETTINGS ===
   VITE_APP_ENV=production
   VITE_APP_URL=https://your-domain.com
   
   # === FEATURE FLAGS ===
   VITE_ENABLE_ANALYTICS=true
   VITE_ENABLE_OFFLINE=true
   ```

### Build Commands

```bash
# Standard production build
npm run build:prod

# Build with bundle analysis
npm run build:analyze

# Quick deployment (skip tests)
npm run deploy:quick

# Full deployment with tests
npm run deploy
```

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Configure environment variables in Vercel dashboard**

**Features**:
- ✅ Automatic SSL
- ✅ Global CDN
- ✅ Serverless functions
- ✅ Automatic deployments from Git
- ✅ Preview deployments

### Option 2: Netlify

1. **Install Netlify CLI**:
   ```bash
   npm i -g netlify-cli
   ```

2. **Deploy**:
   ```bash
   netlify deploy --prod --dir=dist
   ```

3. **Configure environment variables in Netlify dashboard**

**Features**:
- ✅ Automatic SSL
- ✅ Global CDN
- ✅ Form handling
- ✅ Analytics
- ✅ Split testing

### Option 3: Docker + Cloud Provider

1. **Build Docker image**:
   ```bash
   docker build -t anithing-production .
   ```

2. **Run locally**:
   ```bash
   docker run -p 80:80 anithing-production
   ```

3. **Deploy to cloud**:
   - AWS ECS/Fargate
   - Google Cloud Run
   - Azure Container Instances

## 🏎️ Performance Optimizations

### Build Optimizations

The production build includes:

- **Code splitting**: Intelligent chunking for optimal caching
- **Tree shaking**: Remove unused code
- **Minification**: Compressed JavaScript and CSS
- **Image optimization**: WebP conversion and compression
- **Bundle analysis**: Identify optimization opportunities

### Caching Strategy

```nginx
# Static assets - 1 year cache
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
    add_header Cache-Control "public, max-age=31536000, immutable";
}

# HTML - short cache with revalidation
location ~* \.html$ {
    add_header Cache-Control "public, max-age=3600, must-revalidate";
}
```

### CDN Configuration

1. **Configure CDN URLs**:
   ```bash
   VITE_CDN_URL=https://cdn.your-domain.com
   VITE_ASSETS_BASE_URL=https://assets.your-domain.com
   ```

2. **Upload static assets to CDN**:
   ```bash
   aws s3 sync dist/assets/ s3://your-cdn-bucket/assets/
   ```

## 📊 Monitoring & Analytics

### Performance Monitoring

1. **Web Vitals**:
   - Core Web Vitals tracking enabled
   - Real User Monitoring (RUM)
   - Performance budgets enforced

2. **Bundle Analysis**:
   ```bash
   npm run build:analyze
   # Opens bundle-analysis.html
   ```

3. **Lighthouse CI**:
   ```bash
   npm install -g @lhci/cli
   lhci autorun
   ```

### Error Tracking

Configure Sentry (optional):
```bash
VITE_SENTRY_DSN=your-sentry-dsn
VITE_ERROR_REPORTING=true
```

### Analytics

Google Analytics 4 or custom analytics:
```bash
VITE_ANALYTICS_ID=your-analytics-id
VITE_ENABLE_ANALYTICS=true
```

## 🔒 Security Configuration

### Security Headers

All deployments include:

- **CSP**: Content Security Policy
- **HSTS**: HTTP Strict Transport Security  
- **X-Frame-Options**: Clickjacking protection
- **X-Content-Type-Options**: MIME sniffing protection

### Environment Security

- ✅ No sensitive data in client bundle
- ✅ API keys properly scoped
- ✅ CORS configured correctly
- ✅ Rate limiting implemented

## 🚦 Health Checks & Monitoring

### Health Endpoints

- `/health` - Application health
- `/api/health` - API health
- Service worker status

### Monitoring Setup

```bash
# Set up monitoring
VITE_PERFORMANCE_MONITORING=true
VITE_ERROR_REPORTING=true
VITE_LOG_LEVEL=error
```

## 🔄 CI/CD Pipeline

### GitHub Actions (Example)

```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run pre-deploy
      - run: npm run build:prod
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-args: '--prod'
```

## 📈 Scaling Considerations

### Performance Targets

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### Database Scaling

- Supabase handles scaling automatically
- Connection pooling configured
- Read replicas for heavy queries

### CDN Strategy

- Static assets served from CDN
- API responses cached appropriately  
- Geographic distribution

## 🔧 Troubleshooting

### Common Issues

1. **Build Failures**:
   ```bash
   npm run clean && npm run fresh-install
   npm run type-check
   ```

2. **Environment Variables**:
   ```bash
   # Check variables are loaded
   npm run build -- --debug
   ```

3. **Bundle Size Issues**:
   ```bash
   npm run build:analyze
   # Check bundle-analysis.html
   ```

### Debug Mode

Enable debug logging:
```bash
VITE_ENABLE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
```

## 📞 Support

For deployment issues:

1. Check build logs for errors
2. Verify environment configuration
3. Test locally with production build
4. Check network and DNS configuration
5. Review security headers and CORS

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] SSL certificate installed
- [ ] CDN configured for static assets
- [ ] Database migrations applied
- [ ] Monitoring and analytics setup
- [ ] Error tracking configured
- [ ] Performance testing completed
- [ ] Security headers verified
- [ ] Backup strategy in place
- [ ] Domain and DNS configured