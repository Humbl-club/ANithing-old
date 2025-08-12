import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  BookOpen, 
  Star, 
  Heart, 
  TrendingUp,
  Users,
  Settings,
  Calendar,
  Trophy,
  Share2,
  Download,
  Upload,
  Filter,
  Bookmark,
  Clock,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  color: string;
  badge?: string | number;
  isNew?: boolean;
  isPremium?: boolean;
}

interface QuickActionsProps {
  onAddContent?: () => void;
  onSearch?: () => void;
  onImportList?: () => void;
  onExportList?: () => void;
  recentlyWatchingCount?: number;
  planToWatchCount?: number;
  className?: string;
}

const ActionCard: React.FC<{
  action: QuickAction;
  size?: 'sm' | 'md' | 'lg';
}> = memo(({ action, size = 'md' }) => {
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const iconSizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  const content = (
    <div className={cn(
      "relative group cursor-pointer transition-all duration-300 hover:scale-105",
      "bg-gradient-to-br from-background to-muted/30",
      "border border-border/50 rounded-xl",
      "hover:shadow-lg hover:border-primary/20",
      sizeClasses[size]
    )}>
      {/* Background Pattern */}
      <div className={cn(
        "absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity rounded-xl",
        action.color
      )} />
      
      {/* Premium Badge */}
      {action.isPremium && (
        <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs">
          <Star className="w-3 h-3 mr-1" />
          PRO
        </Badge>
      )}

      {/* New Badge */}
      {action.isNew && (
        <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-green-400 to-blue-500 text-xs">
          NEW
        </Badge>
      )}

      <div className="relative space-y-3">
        {/* Icon and Badge */}
        <div className="flex items-center justify-between">
          <div className={cn(
            "p-3 rounded-xl group-hover:scale-110 transition-transform",
            action.color
          )}>
            <div className="text-white">
              {React.cloneElement(action.icon as React.ReactElement, {
                className: iconSizeClasses[size]
              })}
            </div>
          </div>
          
          {action.badge && (
            <Badge variant="secondary" className="text-xs">
              {action.badge}
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="space-y-1">
          <h3 className={cn(
            "font-semibold text-foreground group-hover:text-primary transition-colors",
            size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'
          )}>
            {action.title}
          </h3>
          <p className={cn(
            "text-muted-foreground",
            size === 'sm' ? 'text-xs' : 'text-sm'
          )}>
            {action.description}
          </p>
        </div>
      </div>
    </div>
  );

  if (action.href) {
    return <Link to={action.href}>{content}</Link>;
  }

  return <div onClick={action.onClick}>{content}</div>;
});

export const QuickActions: React.FC<QuickActionsProps> = memo(({ 
  onAddContent,
  onSearch,
  onImportList,
  onExportList,
  recentlyWatchingCount = 0,
  planToWatchCount = 0,
  className 
}) => {
  const primaryActions: QuickAction[] = [
    {
      id: 'browse-anime',
      title: 'Browse Anime',
      description: 'Discover new series',
      icon: <BookOpen />,
      href: '/anime',
      color: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    {
      id: 'browse-manga',
      title: 'Browse Manga',
      description: 'Find great reads',
      icon: <BookOpen />,
      href: '/manga',
      color: 'bg-gradient-to-br from-purple-500 to-purple-600'
    },
    {
      id: 'my-lists',
      title: 'My Lists',
      description: 'Manage collection',
      icon: <Heart />,
      href: '/my-lists',
      color: 'bg-gradient-to-br from-red-500 to-red-600',
      badge: recentlyWatchingCount > 0 ? recentlyWatchingCount : undefined
    },
    {
      id: 'recommendations',
      title: 'Recommendations',
      description: 'Get suggestions',
      icon: <TrendingUp />,
      href: '/recommendations',
      color: 'bg-gradient-to-br from-orange-500 to-orange-600'
    }
  ];

  const secondaryActions: QuickAction[] = [
    {
      id: 'advanced-search',
      title: 'Advanced Search',
      description: 'Filter by genres, year, studio',
      icon: <Search />,
      onClick: onSearch,
      color: 'bg-gradient-to-br from-green-500 to-green-600'
    },
    {
      id: 'add-manually',
      title: 'Add to List',
      description: 'Manually add content',
      icon: <Plus />,
      onClick: onAddContent,
      color: 'bg-gradient-to-br from-indigo-500 to-indigo-600'
    },
    {
      id: 'plan-to-watch',
      title: 'Plan to Watch',
      description: 'Your backlog',
      icon: <Bookmark />,
      href: '/my-lists?filter=plan_to_watch',
      color: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
      badge: planToWatchCount > 0 ? planToWatchCount : undefined
    },
    {
      id: 'currently-watching',
      title: 'Continue Watching',
      description: 'Resume your series',
      icon: <Clock />,
      href: '/my-lists?filter=watching',
      color: 'bg-gradient-to-br from-pink-500 to-pink-600',
      badge: recentlyWatchingCount
    }
  ];

  const utilityActions: QuickAction[] = [
    {
      id: 'social',
      title: 'Social',
      description: 'Friends & follows',
      icon: <Users />,
      href: '/social',
      color: 'bg-gradient-to-br from-teal-500 to-teal-600'
    },
    {
      id: 'achievements',
      title: 'Achievements',
      description: 'Track progress',
      icon: <Trophy />,
      href: '/achievements',
      color: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
      isNew: true
    },
    {
      id: 'import-list',
      title: 'Import List',
      description: 'From MAL, AniList, etc.',
      icon: <Upload />,
      onClick: onImportList,
      color: 'bg-gradient-to-br from-violet-500 to-violet-600'
    },
    {
      id: 'export-list',
      title: 'Export List',
      description: 'Backup your data',
      icon: <Download />,
      onClick: onExportList,
      color: 'bg-gradient-to-br from-emerald-500 to-emerald-600'
    },
    {
      id: 'share-profile',
      title: 'Share Profile',
      description: 'Show your taste',
      icon: <Share2 />,
      href: '/profile/share',
      color: 'bg-gradient-to-br from-rose-500 to-rose-600'
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Customize experience',
      icon: <Settings />,
      href: '/settings',
      color: 'bg-gradient-to-br from-gray-500 to-gray-600'
    }
  ];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Primary Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Quick Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {primaryActions.map((action) => (
              <ActionCard key={action.id} action={action} size="md" />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Secondary Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {secondaryActions.map((action) => (
              <ActionCard key={action.id} action={action} size="sm" />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Utility Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Tools & Social
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
            {utilityActions.map((action) => (
              <ActionCard key={action.id} action={action} size="sm" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

QuickActions.displayName = 'QuickActions';