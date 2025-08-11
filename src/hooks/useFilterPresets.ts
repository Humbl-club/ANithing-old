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
