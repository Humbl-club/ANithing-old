import { create } from 'zustand';

interface InitializationState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  setIsInitialized: (initialized: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setInitialized: (initialized: boolean) => void;
}

export const useInitializationStore = create<InitializationState>((set) => ({
  isInitialized: false,
  isLoading: false,
  error: null,
  setIsInitialized: (initialized: boolean) => set({ isInitialized: initialized }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),
  setInitialized: (initialized: boolean) => set({ isInitialized: initialized, isLoading: false }),
}));