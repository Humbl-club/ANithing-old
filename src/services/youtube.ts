// Minimal stub for YouTube service to satisfy imports in hooks.
// Replace with real implementation if needed.
export interface YouTubeSearchResult {
  id: string;
  title: string;
  thumbnailUrl: string;
}
export interface YouTubeVideoDetails {
  id: string;
  durationSeconds: number;
  channelTitle: string;
}
export const youtubeService = {
  async searchTrailers(_query: string): Promise<YouTubeSearchResult[]> {
    return [];
  },
  async getVideoDetails(_id: string): Promise<YouTubeVideoDetails | null> {
    return null;
  }
};
