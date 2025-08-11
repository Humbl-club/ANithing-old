// Manga feature types
export interface MangaCardProps {
  id: string;
  title: string;
  coverImage?: string;
  score?: number;
  status?: string;
  chapters?: number;
  volumes?: number;
  year?: number;
  genres?: string[];
}
export interface MangaProgress {
  chaptersRead: number;
  volumesRead: number;
  status: 'reading' | 'completed' | 'on-hold' | 'dropped' | 'plan-to-read';
}
export interface MangaStats {
  totalChapters: number;
  readChapters: number;
  totalVolumes: number;
  readVolumes: number;
  averageScore: number;
}