import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Menu, 
  X, 
  Home,
  Film,
  BookOpen,
  TrendingUp,
  User,
  Settings,
  LogIn,
  LogOut,
  List,
  BarChart3,
  Bell,
  Crown,
  Star,
  Zap,
  ChevronDown,
  Heart,
  Bookmark,
  Activity,
  Award,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSimpleGameification } from '@/hooks/useSimpleGameification';
import { UnifiedSearchBar } from '@/features/search/components/UnifiedSearchBar';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Notification types
interface Notification {
  id: string;
  type: 'episode' | 'chapter' | 'achievement' | 'social';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

// Breadcrumb generator
function generateBreadcrumbs(pathname: string) {
  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbs = [{ label: 'Home', path: '/' }];
  
  // Route-specific label mapping
  const routeLabels: { [key: string]: string } = {
    'anime': 'Anime',
    'manga': 'Manga',
    'browse': 'Browse',
    'trending': 'Trending',
    'my-lists': 'My Lists',
    'analytics': 'Analytics',
    'settings': 'Settings',
    'activity': 'Activity Feed',
    'creator': 'Creator',
    'studio': 'Studio',
    'user': 'User Profile',
    'gamification': 'Gamification',
    'admin': 'Admin'
  };
  
  let currentPath = '';
  paths.forEach((path, index) => {
    currentPath += `/${path}`;
    
    // Use custom label if available, otherwise format the path
    let label = routeLabels[path] || path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
    
    // For dynamic routes like /creator/slug or /studio/slug, show the slug nicely formatted
    if (index > 0) {
      const previousPath = paths[index - 1];
      if (previousPath === 'creator' || previousPath === 'studio' || previousPath === 'user') {
        label = path.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
      }
    }
    
    breadcrumbs.push({ label, path: currentPath });
  });
  
  return breadcrumbs;
}

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { stats, loading: statsLoading } = useSimpleGameification();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  
  // Mock notifications - in real app would come from backend
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'episode',
      title: 'New Episode Available!',
      message: 'Attack on Titan Episode 24 is now available',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false
    },
    {
      id: '2', 
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: 'Completed 50 anime series - "Dedicated Otaku" badge earned',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: false
    },
    {
      id: '3',
      type: 'social',
      title: 'Friend Activity',
      message: 'Alex finished watching Demon Slayer',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      read: true
    }
  ]);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  const breadcrumbs = generateBreadcrumbs(location.pathname);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setQuickSearchOpen(true);
        setTimeout(() => searchRef.current?.focus(), 100);
      }
      if (e.key === 'Escape') {
        setQuickSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };
  
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };
  
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'episode': return <Film className="h-4 w-4" />;
      case 'chapter': return <BookOpen className="h-4 w-4" />;
      case 'achievement': return <Award className="h-4 w-4" />;
      case 'social': return <User className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };
  
  const getUserLevel = () => {
    if (!user || statsLoading) return 1;
    return stats.level;
  };
  
  const getUserBadges = () => {
    if (!user || statsLoading) return [];
    return stats.achievements;
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Home, shortcut: 'H' },
    { path: '/anime', label: 'Anime', icon: Film, shortcut: 'A' },
    { path: '/manga', label: 'Manga', icon: BookOpen, shortcut: 'M' },
    { path: '/browse', label: 'Browse', icon: Search, shortcut: 'B' },
    { path: '/trending', label: 'Trending', icon: TrendingUp, shortcut: 'T' },
  ];

  const userNavItems = user ? [
    { path: '/my-lists', label: 'My Lists', icon: List, shortcut: 'L' },
    { path: '/activity', label: 'Activity', icon: Activity, shortcut: 'F' },
    { path: '/analytics', label: 'Analytics', icon: BarChart3, shortcut: 'S' },
    { path: '/settings', label: 'Settings', icon: Settings, shortcut: 'E' },
  ] : [];
  
  const quickActions = [
    { label: 'Add to List', icon: Bookmark, action: () => console.log('Add to list') },
    { label: 'Mark as Watched', icon: Heart, action: () => console.log('Mark watched') },
    { label: 'View Profile', icon: User, action: () => navigate(`/user/${user?.id}`) },
    { label: 'Activity Feed', icon: Activity, action: () => navigate('/activity') },
  ];

  return (
    <>
      {/* Breadcrumbs - only show on desktop and not on home page */}
      {breadcrumbs.length > 1 && (
        <motion.div 
          className="hidden md:block bg-gradient-to-r from-pink-500/5 to-purple-600/5 border-b border-pink-200/20 dark:border-pink-800/20"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="container mx-auto px-4 py-2">
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb.path} className="flex items-center">
                    <BreadcrumbItem>
                      {index === breadcrumbs.length - 1 ? (
                        <BreadcrumbPage className="text-pink-600 dark:text-pink-400 font-medium">
                          {crumb.label}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link 
                            to={crumb.path} 
                            className="text-muted-foreground hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                          >
                            {crumb.label}
                          </Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </motion.div>
      )}
      
      {/* Main Navigation */}
      <motion.nav 
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-500",
          scrolled 
            ? "bg-black/70 backdrop-blur-2xl border-b border-pink-500/30 shadow-glass-xl shadow-pink-500/10" 
            : "bg-gradient-to-r from-black/50 via-purple-900/30 to-black/50 backdrop-blur-xl border-b border-pink-500/20"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Desktop Nav */}
            <div className="flex items-center gap-6">
              {/* ANITHING Logo */}
              <Link to="/" className="flex items-center gap-3 group">
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
                  <div className="relative bg-gradient-to-r from-pink-500 to-purple-600 p-2 rounded-lg">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                </motion.div>
                <div className="flex flex-col">
                  <span className="font-bold text-xl bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                    ANITHING
                  </span>
                  <span className="text-xs text-pink-300/70 -mt-1">Anime & Manga Hub</span>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <motion.div key={item.path} whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
                      <Link
                        to={item.path}
                        className={cn(
                          "relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 group",
                          isActive
                            ? "text-white shadow-lg shadow-pink-500/25"
                            : "text-pink-200/80 hover:text-white hover:bg-white/5"
                        )}
                      >
                        {isActive && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg"
                            layoutId="activeTab"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        <div className="relative flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {item.label}
                          <span className="text-xs opacity-50 group-hover:opacity-100 transition-opacity">
                            {item.shortcut}
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Quick Search - Desktop */}
            <div className="hidden md:block flex-1 max-w-md mx-4">
              <motion.div 
                className="relative"
                whileFocus={{ scale: 1.02 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-600/20 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-pink-300" />
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Search anime, manga... (⌘K)"
                    className="w-full pl-10 pr-4 py-2 bg-white/8 border border-pink-500/20 rounded-xl text-white placeholder-pink-300/50 focus:outline-none focus:border-pink-400 focus:bg-white/12 transition-all backdrop-blur-xl hover:bg-white/10 hover:border-pink-500/30"
                    onFocus={() => setQuickSearchOpen(true)}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-pink-300/50 hidden group-hover:block">
                    ⌘K
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* User Menu - Desktop */}
              <div className="hidden md:flex items-center gap-2">
                {user ? (
                  <>
                    {/* Notification Bell */}
                    <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                      <PopoverTrigger asChild>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="relative text-pink-200 hover:text-white hover:bg-white/10"
                          >
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                              <motion.div
                                className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", bounce: 0.5 }}
                              >
                                <span className="text-xs font-bold text-white">
                                  {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                              </motion.div>
                            )}
                          </Button>
                        </motion.div>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0 bg-black/80 backdrop-blur-2xl border-pink-500/30 shadow-glass-xl" align="end">
                        <div className="p-4 border-b border-pink-500/20">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-white">Notifications</h3>
                            {unreadCount > 0 && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={markAllAsRead}
                                className="text-pink-400 hover:text-pink-300"
                              >
                                Mark all read
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {notifications.length > 0 ? (
                            notifications.map((notification) => (
                              <motion.div
                                key={notification.id}
                                className={cn(
                                  "p-3 border-b border-pink-500/10 hover:bg-white/5 cursor-pointer transition-colors",
                                  !notification.read && "bg-pink-500/5"
                                )}
                                onClick={() => markNotificationAsRead(notification.id)}
                                whileHover={{ x: 5 }}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="text-pink-400">
                                    {getNotificationIcon(notification.type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">
                                      {notification.title}
                                    </p>
                                    <p className="text-xs text-pink-200/70 mt-1">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-pink-300/50 mt-1">
                                      {notification.timestamp.toLocaleDateString()}
                                    </p>
                                  </div>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-pink-500 rounded-full flex-shrink-0" />
                                  )}
                                </div>
                              </motion.div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-pink-300/50">
                              No notifications yet
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>

                    {/* Quick Actions */}
                    {userNavItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <motion.div key={item.path} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                          <Link to={item.path}>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-pink-200 hover:text-white hover:bg-white/10"
                            >
                              <Icon className="h-5 w-5" />
                            </Button>
                          </Link>
                        </motion.div>
                      );
                    })}

                    {/* User Profile Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button variant="ghost" className="relative h-10 w-auto px-3 rounded-xl bg-white/10 backdrop-blur-xl border border-pink-500/30 hover:bg-white/15 hover:border-pink-500/40 hover:scale-105 transition-all duration-300">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <Avatar className="h-8 w-8 border-2 border-pink-400/50">
                                  <AvatarImage src={user.user_metadata?.avatar_url} />
                                  <AvatarFallback className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold">
                                    {user.email?.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                {/* Level Badge */}
                                <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-1">
                                  <Crown className="h-3 w-3 text-white" />
                                </div>
                              </div>
                              <div className="hidden lg:flex flex-col items-start">
                                <span className="text-sm font-medium text-white">
                                  Level {getUserLevel()}
                                </span>
                                <div className="flex items-center gap-1">
                                  {getUserBadges().slice(0, 2).map((badge, index) => (
                                    <Star key={index} className="h-3 w-3 text-yellow-400" />
                                  ))}
                                </div>
                              </div>
                              <ChevronDown className="h-4 w-4 text-pink-300" />
                            </div>
                          </Button>
                        </motion.div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-64 bg-black/80 backdrop-blur-2xl border-pink-500/30 shadow-glass-xl" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 border-2 border-pink-400/50">
                              <AvatarImage src={user.user_metadata?.avatar_url} />
                              <AvatarFallback className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-lg">
                                {user.email?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <p className="text-sm font-medium leading-none text-white">
                                {user.user_metadata?.username || 'User'}
                              </p>
                              <p className="text-xs leading-none text-pink-300/70 mt-1">
                                {user.email}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 text-yellow-400 border-yellow-400/30">
                                  Level {getUserLevel()}
                                </Badge>
                                <div className="flex items-center gap-1">
                                  <Zap className="h-3 w-3 text-blue-400" />
                                  <span className="text-xs text-blue-400">{stats.exp} XP</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="border-pink-500/20" />
                        
                        {/* Quick Actions */}
                        <div className="p-2">
                          <p className="text-xs font-semibold text-pink-300/70 mb-2 px-2">Quick Actions</p>
                          {quickActions.map((action, index) => (
                            <DropdownMenuItem 
                              key={index}
                              onClick={action.action}
                              className="text-pink-200 hover:text-white hover:bg-white/10 focus:bg-white/10"
                            >
                              <action.icon className="mr-2 h-4 w-4" />
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                        </div>
                        
                        <DropdownMenuSeparator className="border-pink-500/20" />
                        <DropdownMenuItem 
                          onClick={() => navigate(`/user/${user.id}`)}
                          className="text-pink-200 hover:text-white hover:bg-white/10 focus:bg-white/10"
                        >
                          <User className="mr-2 h-4 w-4" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => navigate('/settings')}
                          className="text-pink-200 hover:text-white hover:bg-white/10 focus:bg-white/10"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="border-pink-500/20" />
                        <DropdownMenuItem 
                          onClick={handleLogout}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Log out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/auth">
                      <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-pink-500/25">
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign In
                      </Button>
                    </Link>
                  </motion.div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-pink-200 hover:text-white hover:bg-white/10"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={mobileMenuOpen ? 'close' : 'menu'}
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </motion.div>
                  </AnimatePresence>
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div 
                className="md:hidden border-t border-pink-500/20 bg-black/95 backdrop-blur-xl"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <div className="py-4">
                  {/* Mobile Search */}
                  <motion.div 
                    className="px-4 pb-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-pink-300" />
                      <input
                        type="text"
                        placeholder="Search anime, manga..."
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-pink-500/20 rounded-lg text-white placeholder-pink-300/50 focus:outline-none focus:border-pink-400 focus:bg-white/10 transition-all"
                      />
                    </div>
                  </motion.div>

                  {/* User Info - Mobile */}
                  {user && (
                    <motion.div 
                      className="px-4 py-3 border-b border-pink-500/20 mb-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-pink-400/50">
                          <AvatarImage src={user.user_metadata?.avatar_url} />
                          <AvatarFallback className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold">
                            {user.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">
                            {user.user_metadata?.username || 'User'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 text-yellow-400 border-yellow-400/30 text-xs">
                              Level {getUserLevel()}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Zap className="h-3 w-3 text-blue-400" />
                              <span className="text-xs text-blue-400">{stats.exp} XP</span>
                            </div>
                          </div>
                        </div>
                        {/* Notifications - Mobile */}
                        <div className="relative">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-pink-200 hover:text-white hover:bg-white/10"
                            onClick={() => setNotificationsOpen(!notificationsOpen)}
                          >
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                              <div className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-white">
                                  {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                              </div>
                            )}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Mobile Nav Items */}
                  <div className="space-y-1 px-4">
                    {[...navItems, ...userNavItems].map((item, index) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      return (
                        <motion.div
                          key={item.path}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + index * 0.05 }}
                        >
                          <Link
                            to={item.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                              isActive
                                ? "bg-gradient-to-r from-pink-500/20 to-purple-600/20 text-white border border-pink-500/30"
                                : "text-pink-200/80 hover:text-white hover:bg-white/5"
                            )}
                          >
                            <Icon className="h-5 w-5" />
                            <span className="flex-1">{item.label}</span>
                            <span className="text-xs opacity-50">{item.shortcut}</span>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Mobile Auth */}
                  <motion.div 
                    className="border-t border-pink-500/20 mt-4 pt-4 px-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {user ? (
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg w-full transition-all"
                      >
                        <LogOut className="h-5 w-5" />
                        Log out
                      </button>
                    ) : (
                      <Link
                        to="/auth"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-3 px-4 py-3 text-sm font-medium bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-lg transition-all shadow-lg shadow-pink-500/25"
                      >
                        <LogIn className="h-5 w-5" />
                        Sign In
                      </Link>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>
      
      {/* Quick Search Modal */}
      <AnimatePresence>
        {quickSearchOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setQuickSearchOpen(false)}
          >
            <motion.div
              className="bg-black/90 backdrop-blur-xl border border-pink-500/20 rounded-lg p-4 w-full max-w-md mx-4 shadow-xl shadow-pink-500/10"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-pink-300" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search anime, manga..."
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-pink-500/20 rounded-lg text-white placeholder-pink-300/50 focus:outline-none focus:border-pink-400 focus:bg-white/10 transition-all"
                  autoFocus
                />
              </div>
              <div className="mt-4 text-center">
                <p className="text-xs text-pink-300/50">Press ESC to close</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}