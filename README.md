# AniThing - Ultimate Anime & Manga Tracker

<div align="center">
  <h3>🎌 Discover • Track • Share • Connect</h3>
  <p>Your complete anime and manga companion with social features, advanced search, and personalized recommendations.</p>
  
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
  [![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
</div>

## ✨ Features

### 🎯 Core Features
- **🗃️ Massive Database**: 19,000+ anime and manga titles from AniList
- **🔍 Advanced Search**: Multi-filter search with genres, studios, ratings, years
- **👤 User Profiles**: Personalized accounts with custom lists and preferences  
- **⭐ Reviews & Ratings**: Rate titles and write detailed reviews
- **🎭 Character Search**: Find anime/manga by character names
- **🤖 Smart Recommendations**: AI-powered suggestions based on your taste

### 🌟 Social Features
- **👥 Follow System**: Connect with other anime/manga fans
- **📝 Custom Lists**: Create and share curated collections
- **💬 Social Sharing**: Share your favorite titles and lists
- **🎮 Activity Feed**: See what your friends are watching/reading

### 🔄 Data Management
- **📥 Auto-Import**: Daily automated content updates from AniList
- **🔄 Real-time Sync**: Always up-to-date information
- **📊 Rich Metadata**: Detailed information including studios, genres, characters
- **🖼️ Optimized Images**: Fast-loading, responsive images

### 🎨 User Experience
- **📱 Mobile-First**: Responsive design for all devices
- **🌙 Modern UI**: Clean, intuitive interface with shadcn/ui
- **⚡ Fast Performance**: Optimized loading and caching
- **🔒 Secure**: Row-level security with Supabase

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd star-dust-anime

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

### Environment Variables
```bash
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_APP_ENV=development
```

## 📱 Usage

### For Users
1. **Sign Up**: Create an account to start tracking
2. **Explore**: Browse the extensive anime/manga database
3. **Search**: Use advanced filters to find exactly what you want
4. **Track**: Add titles to your custom lists (Watching, Completed, etc.)
5. **Rate & Review**: Share your thoughts with the community
6. **Connect**: Follow other users and discover new content
7. **Discover**: Get personalized recommendations

### For Developers
1. **Database**: Powered by Supabase with PostgreSQL
2. **Frontend**: React + TypeScript + Vite
3. **Styling**: Tailwind CSS + shadcn/ui components
4. **Data**: AniList GraphQL API integration
5. **Auth**: Supabase authentication with RLS
6. **Deployment**: Vercel/Netlify ready

## 🏗️ Architecture

```
src/
├── components/         # Reusable UI components
├── hooks/             # Custom React hooks  
├── integrations/      # External service integrations
├── pages/             # Route components
├── shared/            # Shared utilities and components
│   ├── components/    # Feature components
│   │   ├── AdvancedSearch.tsx
│   │   ├── CharacterSearch.tsx  
│   │   ├── RecommendationEngine.tsx
│   │   ├── ReviewSystem.tsx
│   │   └── SocialFeatures.tsx
│   └── utils/         # Helper functions
├── store/             # State management
└── types/             # TypeScript definitions

supabase/
├── functions/         # Edge functions
│   ├── daily-import/  # Automated data imports
│   ├── import-anime/  # Anime import functions
│   └── import-manga/  # Manga import functions
└── migrations/        # Database schema
```

## 🗄️ Database Schema

### Core Tables
- `titles` - Anime/manga entries with metadata
- `anime_details` - Anime-specific information
- `manga_details` - Manga-specific information  
- `genres` - Genre categories
- `studios` - Animation/manga studios

### Social Tables
- `user_follows` - User follow relationships
- `user_lists` - Custom user lists
- `user_list_items` - Items within lists
- `reviews` - User reviews and ratings
- `user_activity` - Activity feed data

### Rich Data (JSONB)
- `characters_data` - Character information
- `external_links` - Streaming/reading links
- `detailed_tags` - Enhanced categorization
- `studios_data` - Studio details

## 🔄 Data Import System

The application features a sophisticated import system that pulls data from AniList:

### Import Features
- **Automated Daily Updates**: GitHub Actions workflow runs daily at 2 AM UTC
- **Rate Limiting**: Respects AniList API limits (90 requests/minute)
- **Error Handling**: Comprehensive logging and retry mechanisms
- **Incremental Updates**: Only imports new/updated content
- **Quality Filtering**: Excludes adult content and low-rated titles

### Manual Import Commands
```bash
# Import all anime (takes ~2 hours)
node import-all-anime.js

# Import all manga (takes ~10+ hours)  
node import-all-manga.js

# Run daily import manually
node run-daily-import-manual.js

# Check import status
node check-import-status.js
```

## 🎨 UI Components

Built with modern, accessible components:

### Search & Discovery
- **AdvancedSearch**: Multi-filter search interface
- **CharacterSearch**: Search by character names
- **RecommendationEngine**: Personalized content suggestions

### Social Features  
- **SocialFeatures**: Follow system and user discovery
- **ReviewSystem**: Ratings and review management
- **UserLists**: Custom list creation and sharing

### Utilities
- **OptimizedImage**: Responsive image loading
- **LoadingSpinner**: Consistent loading states
- **ErrorBoundary**: Graceful error handling

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy with one click

### Manual Deployment
```bash
# Build for production
npm run build

# Deploy dist/ folder to your hosting provider
```

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

## 📊 Performance

- **Bundle Size**: Optimized with code splitting
- **Loading Speed**: Image optimization and lazy loading
- **Database**: Indexed queries and caching
- **CDN**: Static asset optimization
- **Mobile**: Responsive design with touch optimization

## 🔐 Security

- **Authentication**: Supabase Auth with social providers
- **Authorization**: Row Level Security (RLS) policies
- **API Security**: Service role keys and rate limiting
- **Data Privacy**: GDPR-compliant data handling
- **Content Filtering**: Adult content exclusion

## 🧪 Testing

```bash
# Run tests
npm run test

# Type checking
npm run type-check  

# Linting
npm run lint

# End-to-end tests
npm run test:e2e
```

## 📈 Analytics & Monitoring

### Included Analytics
- User engagement tracking
- Search query analysis
- Import job monitoring
- Performance metrics

### Recommended Integrations
- **Sentry**: Error tracking
- **Vercel Analytics**: Performance monitoring
- **PostHog**: User behavior analysis

## 🛣️ Roadmap

### Phase 1 ✅ (Completed)
- [x] Core anime/manga database
- [x] Advanced search functionality
- [x] User authentication  
- [x] Reviews and ratings
- [x] Character search
- [x] Social features
- [x] Automated imports

### Phase 2 🔄 (In Progress)
- [ ] Mobile app (React Native)
- [ ] Offline functionality
- [ ] Push notifications
- [ ] Advanced analytics

### Phase 3 🗓️ (Planned)
- [ ] AI-powered recommendations
- [ ] Community forums
- [ ] Watch party features
- [ ] Merchandise integration

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- **AniList**: For providing the comprehensive anime/manga database
- **Supabase**: For the excellent backend-as-a-service platform
- **shadcn/ui**: For the beautiful component library
- **Community**: For feedback and contributions

## 📞 Support

- 📧 Email: support@anithing.app
- 💬 Discord: [Join our community](https://discord.gg/anithing)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/anithing/issues)
- 📖 Docs: [Documentation](https://docs.anithing.app)

## 🎉 Fun Stats

- **19,000+** anime and manga titles
- **50+** genres to explore  
- **500+** animation studios
- **Real-time** data synchronization
- **Mobile-first** responsive design
- **Open source** and community-driven

---

<div align="center">
  <p>Built with ❤️ by the anime and manga community</p>
  <p>Star ⭐ this repository if you found it helpful!</p>
</div>
