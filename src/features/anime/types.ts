// Anime feature types
import { type UserTitleListEntry } from '@/types/userLists';
import { type Anime } from '@/data/animeData';

export interface AnimeFillerData {
  episode: number;
  isFiller: boolean;
  title?: string;
  description?: string;
}

export interface AnimeStats {
  totalEpisodes: number;
  watchedEpisodes: number;
  averageScore: number;
  completionRate: number;
}

export interface AnimeListItemProps {
  entry: UserTitleListEntry;
  anime: Anime;
  onUpdate: (id: string, updates: Partial<UserTitleListEntry>) => void;
  StatusIcon: React.ComponentType<{ className?: string }>;
  statusColor: string;
}
export interface TrailerData {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  duration?: number;
}