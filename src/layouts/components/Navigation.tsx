import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Menu, 
  Home, 
  TrendingUp, 
  BookOpen, 
  Play, 
  User,
  Bell,
  Settings,
  Database,
  Star,
  Heart,
  Loader2, 
  Sparkles,
  BarChart3,
  X,
  Palette,
  Languages,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useSimpleGameification } from "@/hooks/useSimpleGameification";
import { useSearch } from "@/hooks/useSearch";
import { useNativeSetup } from "@/hooks/useNativeSetup";
import { useNativeActions } from "@/hooks/useNativeActions";
import { ProfileMenu } from "@/features/user/components/ProfileMenu";
import { UnifiedSearchBar } from "@/features/search/components/UnifiedSearchBar";
import { useNamePreference } from "@/hooks/useNamePreference";
import { useUIStore } from "@/store";
import { Switch } from "@/components/ui/switch";
import { FeatureWrapper } from "@/shared/components/FeatureWrapper";
import { logger } from "@/utils/logger";
import { env } from "@/config/environment";

interface NavigationProps {
  onSearch?: (query: string) => void;
}

export const Navigation = memo(({ onSearch }: NavigationProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { stats } = useSimpleGameification();
  const navigate = useNavigate();
  const { showEnglish, setShowEnglish } = useNamePreference();
  const { navigation, setMobileMenuOpen } = useUIStore();
  const { query, setQuery, search, isSearching, results, clearSearch } = useSearch();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { isNative, keyboardVisible } = useNativeSetup();
  const { triggerHaptic } = useNativeActions();

  // Optimize scroll handler with throttling
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Search handler - no need to memoize
  const handleSearch = async () => {
    if (query.trim()) {
      if (onSearch) {
        onSearch(query.trim());
      } else {
        setShowResults(true);
        await search(query.trim());
      }
    }
  };

  // Key press handler - no need to memoize
  const handleKeyPress = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      await handleSearch();
    }
  };

  // Input change handler - no need to memoize
  const handleInputChange = (value: string) => {
    logger.debug('Input changed:', value);
    setQuery(value);
    
    if (value.trim().length > 2) {
      logger.debug('Triggering search for:', value.trim());
      setShowResults(true);
      search(value.trim());
    } else if (value.trim().length === 0) {
      setShowResults(false);
      clearSearch();
    }
  };

  // Anime click handler - no need to memoize
  const handleAnimeClick = (anime: any) => {
    navigate(`/anime/${anime.id}`);
    setShowResults(false);
    clearSearch();
  };

  // Optimize click outside handler
  useEffect(() => {
    if (!showResults) return;
    
    const handleClickOutside = () => {
      setShowResults(false);
    };
    
    // Delay adding event listener to avoid immediate trigger
    const timer = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 100);
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showResults]);

  // Static navigation items - no need to memoize
  const navItems = [
    { path: "/", icon: Home, label: "Home", color: "text-blue-500" },
    { path: "/trending", icon: TrendingUp, label: "Trending", color: "text-green-500" },
    { path: "/anime", icon: Play, label: "Anime", color: "text-purple-500" },
    { path: "/manga", icon: BookOpen, label: "Manga", color: "text-orange-500" },
  ];

  // User navigation items - simple conditional
  const userNavItems = !user ? [] : [
    { path: "/my-lists", icon: Heart, label: "My Lists", color: "text-red-500" },
    { path: "/analytics", icon: BarChart3, label: "Analytics", color: "text-cyan-500" },
    { path: "/gamification", icon: Sparkles, label: "Rewards", color: "text-yellow-500" },
  ];

  // Mobile menu toggle handler - no need to memoize
  const handleMobileMenuToggle = () => {
    if (isNative) {
      triggerHaptic('light');
    }
    setMobileMenuOpen(!navigation.mobileMenuOpen);
  };

  // Language toggle handler - no need to memoize
  const handleLanguageToggle = (checked: boolean) => {
    setShowEnglish(checked);
  };

  // Class names - no need to memoize simple string concatenations
  const navClasses = cn(
    "sticky top-0 z-50 transition-all duration-300",
    isScrolled ? "bg-background/95 backdrop-blur-lg border-b shadow-lg" : "bg-background/80 backdrop-blur-sm"
  );

  const mobileMenuClasses = cn(
    "lg:hidden fixed inset-0 z-[60] bg-background/95 backdrop-blur-lg transform transition-transform duration-300 ease-in-out",
    navigation.mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
  );

  // Early return for loading state
  if (loading) {
    return (
      <nav className={navClasses}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className={navClasses}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={handleMobileMenuToggle}
              >
                {navigation.mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              
              <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="relative">
                  <Star className="h-8 w-8 text-primary fill-primary" />
                  <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <span className="font-bold text-xl hidden sm:inline gradient-text">
                  Star Dust Anime
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-accent",
                    location.pathname === item.path && "bg-accent"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", item.color)} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
              
              {userNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-accent",
                    location.pathname === item.path && "bg-accent"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", item.color)} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Search and User Actions */}
            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="hidden sm:block relative">
                <FeatureWrapper feature="unifiedSearch">
                  <UnifiedSearchBar />
                </FeatureWrapper>
                <FeatureWrapper feature="unifiedSearch" invert>
                  <div className="relative">
                    <Input
                      type="search"
                      placeholder="Search anime..."
                      value={query}
                      onChange={(e) => handleInputChange(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-[200px] md:w-[300px] pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    {isSearching && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
                    )}
                  </div>
                </FeatureWrapper>
              </div>

              {/* Language Toggle */}
              <FeatureWrapper feature="namePreference">
                <div className="hidden sm:flex items-center gap-2">
                  <Languages className="h-4 w-4 text-muted-foreground" />
                  <Switch
                    checked={showEnglish}
                    onCheckedChange={handleLanguageToggle}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </FeatureWrapper>

              {/* Notifications */}
              {user && (
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {stats?.notifications > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                    >
                      {stats.notifications}
                    </Badge>
                  )}
                </Button>
              )}

              {/* Profile Menu */}
              <ProfileMenu />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={mobileMenuClasses}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <span className="font-bold text-xl gradient-text">Menu</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMobileMenuToggle}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-accent",
                  location.pathname === item.path && "bg-accent"
                )}
              >
                <item.icon className={cn("h-5 w-5", item.color)} />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
            
            {user && userNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-accent",
                  location.pathname === item.path && "bg-accent"
                )}
              >
                <item.icon className={cn("h-5 w-5", item.color)} />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute top-16 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-b shadow-lg max-h-96 overflow-y-auto">
          <div className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.slice(0, 9).map((anime) => (
                <div
                  key={anime.id}
                  onClick={() => handleAnimeClick(anime)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                >
                  <img
                    src={anime.coverImage?.medium || anime.image_url}
                    alt={anime.title?.romaji || anime.title}
                    className="w-12 h-16 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {showEnglish 
                        ? (anime.title?.english || anime.title?.romaji || anime.title)
                        : (anime.title?.romaji || anime.title)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {anime.format || anime.type} • {anime.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
});
