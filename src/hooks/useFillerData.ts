export function useFillerData(animeId?: string) {
  return {
    data: [],
    loading: false,
    error: null,
    fillerData: null,
    isLoading: false,
    getMainStoryProgress: () => 0,
    getNextMainStoryEpisode: () => null,
    isFillerEpisode: (ep: number) => false
  };
}
