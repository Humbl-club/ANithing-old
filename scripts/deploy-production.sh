#!/bin/bash

# Production Deployment Script for AniThing
# This script handles the complete production deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="anithing-anime-tracker"
BUILD_DIR="dist"
DOCKER_IMAGE="anithing-production"

echo -e "${BLUE}🚀 Starting production deployment for ${PROJECT_NAME}...${NC}"

# Function to print status
print_status() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Pre-deployment checks
print_status "Running pre-deployment checks..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"
if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    print_error "Node.js version $NODE_VERSION is too old. Please install Node.js 18+ first."
    exit 1
fi

# Check if package.json exists
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

print_success "Pre-deployment checks passed"

# Environment setup
print_status "Setting up production environment..."

# Create production environment file if it doesn't exist
if [ ! -f ".env.production" ]; then
    print_warning ".env.production not found. Creating from template..."
    cp .env.production.example .env.production
    print_warning "Please configure .env.production with your production values before continuing."
    read -p "Press enter when ready to continue..."
fi

# Validate required environment variables
if [ -f ".env.production" ]; then
    source .env.production
    if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
        print_error "Required environment variables are missing. Please check .env.production"
        exit 1
    fi
fi

print_success "Environment configuration validated"

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf $BUILD_DIR
rm -rf node_modules/.vite
print_success "Build cache cleared"

# Install dependencies
print_status "Installing production dependencies..."
npm ci --only=production --no-audit --no-fund
print_success "Dependencies installed"

# Run tests (optional)
if [ "$1" != "--skip-tests" ]; then
    print_status "Running tests..."
    npm run test:unit || {
        print_warning "Tests failed. Continue anyway? (y/N)"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            print_error "Deployment aborted due to test failures"
            exit 1
        fi
    }
    print_success "Tests completed"
fi

# Type checking
print_status "Running TypeScript type checking..."
npx tsc --noEmit || {
    print_error "TypeScript compilation errors found. Please fix them first."
    exit 1
}
print_success "TypeScript validation passed"

# Linting
print_status "Running code linting..."
npm run lint || {
    print_warning "Linting issues found. Continue anyway? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        print_error "Deployment aborted due to linting issues"
        exit 1
    fi
}
print_success "Code quality checks completed"

# Build for production
print_status "Building for production..."

# Use production Vite config if it exists
if [ -f "vite.config.production.ts" ]; then
    npx vite build --config vite.config.production.ts
else
    npm run build
fi

# Verify build output
if [ ! -d "$BUILD_DIR" ]; then
    print_error "Build failed - $BUILD_DIR directory not found"
    exit 1
fi

# Check if essential files exist
essential_files=("index.html" "assets" "manifest.json")
for file in "${essential_files[@]}"; do
    if [ ! -e "$BUILD_DIR/$file" ]; then
        print_error "Build incomplete - $file not found in $BUILD_DIR"
        exit 1
    fi
done

print_success "Production build completed successfully"

# Bundle analysis
print_status "Analyzing bundle size..."
if [ -f "$BUILD_DIR/bundle-analysis.html" ]; then
    print_success "Bundle analysis available at $BUILD_DIR/bundle-analysis.html"
else
    print_warning "Bundle analysis not generated"
fi

# Security scan (if available)
if command -v npm-audit &> /dev/null; then
    print_status "Running security audit..."
    npm audit --audit-level high || print_warning "Security vulnerabilities found - please review"
fi

# Docker build (optional)
if [ "$2" = "--docker" ]; then
    print_status "Building Docker image..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Skipping Docker build."
    else
        docker build -t $DOCKER_IMAGE:latest .
        docker tag $DOCKER_IMAGE:latest $DOCKER_IMAGE:$(date +%Y%m%d-%H%M%S)
        print_success "Docker image built: $DOCKER_IMAGE:latest"
    fi
fi

# Deployment size report
print_status "Generating deployment report..."
BUILD_SIZE=$(du -sh $BUILD_DIR | cut -f1)
GZIP_SIZE=$(find $BUILD_DIR -name "*.js" -exec gzip -c {} \; | wc -c | numfmt --to=iec)

echo "
📊 DEPLOYMENT REPORT
=====================
Build Directory: $BUILD_DIR
Total Size: $BUILD_SIZE
Gzipped JS: $GZIP_SIZE
Node Version: $NODE_VERSION
Build Time: $(date)
"

# Deployment options
print_success "🎉 Production build ready for deployment!"

echo -e "${BLUE}
📋 NEXT STEPS:
===============

For Vercel deployment:
  vercel --prod

For Netlify deployment:
  netlify deploy --prod --dir=$BUILD_DIR

For Docker deployment:
  docker run -p 80:80 $DOCKER_IMAGE:latest

For manual deployment:
  Upload the contents of $BUILD_DIR to your web server

For CDN setup:
  Configure your CDN to serve static assets from $BUILD_DIR/assets/

Environment variables needed in your hosting platform:
$(grep "^VITE_" .env.production | head -10)
...
${NC}"

print_success "Deployment script completed successfully!"

# Optional: Open bundle analysis
if [ -f "$BUILD_DIR/bundle-analysis.html" ]; then
    echo -e "${YELLOW}Would you like to view the bundle analysis? (y/N)${NC}"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        if command -v open &> /dev/null; then
            open "$BUILD_DIR/bundle-analysis.html"
        elif command -v xdg-open &> /dev/null; then
            xdg-open "$BUILD_DIR/bundle-analysis.html"
        fi
    fi
fi