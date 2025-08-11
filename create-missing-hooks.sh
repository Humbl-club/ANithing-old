#!/bin/bash

echo "🚀 Creating all missing hooks..."

# Create useAnalytics
cat > ./src/hooks/useAnalytics.ts << 'EOF'
import { useState, useEffect } from 'react';

interface AnalyticsData {
  pageViews: number;
  uniqueUsers: number;
  topContent: Array<{ title: string; views: number }>;
  userActivity: Array<{ date: string; activity: number }>;
}

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock analytics data
    setTimeout(() => {
      setData({
        pageViews: 12543,
        uniqueUsers: 3421,
        topContent: [
          { title: 'Attack on Titan', views: 1234 },
          { title: 'Demon Slayer', views: 987 },
          { title: 'One Piece', views: 856 }
        ],
        userActivity: [
          { date: '2024-01-01', activity: 45 },
          { date: '2024-01-02', activity: 67 },
          { date: '2024-01-03', activity: 89 }
        ]
      });
      setLoading(false);
    }, 1000);
  }, []);

  return { data, loading, error };
}
EOF

# Create useUserPreferences  
cat > ./src/hooks/useUserPreferences.ts << 'EOF'
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: boolean;
  autoPlay: boolean;
  showAdultContent: boolean;
}

export function useUserPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'system',
    language: 'en',
    notifications: true,
    autoPlay: false,
    showAdultContent: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user preferences
    const saved = localStorage.getItem('user-preferences');
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
    setLoading(false);
  }, [user]);

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    const newPrefs = { ...preferences, ...updates };
    setPreferences(newPrefs);
    localStorage.setItem('user-preferences', JSON.stringify(newPrefs));
  };

  return { preferences, updatePreferences, loading };
}
EOF

# Create useFilterPresets
cat > ./src/hooks/useFilterPresets.ts << 'EOF'
import { useState, useEffect } from 'react';

interface FilterPreset {
  id: string;
  name: string;
  filters: Record<string, any>;
}

export function useFilterPresets(contentType: 'anime' | 'manga') {
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load presets from localStorage
    const saved = localStorage.getItem(`filter-presets-${contentType}`);
    if (saved) {
      setPresets(JSON.parse(saved));
    }
    setIsLoading(false);
  }, [contentType]);

  const savePreset = async (name: string, filters: Record<string, any>) => {
    const newPreset: FilterPreset = {
      id: Date.now().toString(),
      name,
      filters
    };
    const newPresets = [...presets, newPreset];
    setPresets(newPresets);
    localStorage.setItem(`filter-presets-${contentType}`, JSON.stringify(newPresets));
    return newPreset;
  };

  const loadPreset = async (id: string) => {
    const preset = presets.find(p => p.id === id);
    return preset?.filters || {};
  };

  const deletePreset = async (id: string) => {
    const newPresets = presets.filter(p => p.id !== id);
    setPresets(newPresets);
    localStorage.setItem(`filter-presets-${contentType}`, JSON.stringify(newPresets));
  };

  return {
    presets,
    savePreset,
    loadPreset,
    deletePreset,
    isLoading
  };
}
EOF

echo "✅ Created all missing hooks!"
echo "📦 Testing build..."

# Test build
npm run build 2>&1 | tail -5