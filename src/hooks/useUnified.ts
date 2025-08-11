/**
 * UNIFIED HOOKS MODULE
 * Consolidates similar hooks to reduce code duplication
 * Saves ~1,000 lines by merging similar functionality
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

// ============= CONTENT HOOKS =============

/**
 * Generic content fetching hook
*/
export function useContent(
  contentType: 'anime' | 'manga' | 'both',
  options?: {
    limit?: number;
    filters?: Record<string, any>;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
) {
  return useQuery({
    queryKey: ['content', contentType, options],
    queryFn: async () => {
      let query = supabase.from('titles').select('*');
      
      if (contentType !== 'both') {
        query = query.eq('content_type', contentType);
      }
      
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            query = query.eq(key, value);
          }
        });
      }
      
      if (options?.sortBy) {
        query = query.order(options.sortBy, { 
          ascending: options.sortOrder === 'asc' 
        });
      }
      
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
}

/**
 * Generic search hook
*/
export function useSearch(
  searchQuery: string,
  contentType?: 'anime' | 'manga' | 'both',
  debounceMs = 300
) {
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, debounceMs);
    
    return () => clearTimeout(timer);
  }, [searchQuery, debounceMs]);
  
  return useQuery({
    queryKey: ['search', debouncedQuery, contentType],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) return [];
      
      let query = supabase
        .from('titles')
        .select('*')
        .or(`title.ilike.%${debouncedQuery}%,title_english.ilike.%${debouncedQuery}%`);
      
      if (contentType && contentType !== 'both') {
        query = query.eq('content_type', contentType);
      }
      
      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data;
    },
    enabled: debouncedQuery.length >= 2
  });
}

// ============= USER HOOKS =============

/**
 * Unified user data hook
*/
export function useUserData(userId?: string) {
  const { user } = useAuthStore();
  const targetUserId = userId || user?.id;
  
  const profile = useQuery({
    queryKey: ['profile', targetUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!targetUserId
  });
  
  const lists = useQuery({
    queryKey: ['lists', targetUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_lists')
        .select('*, user_list_items(count)')
        .eq('user_id', targetUserId);
      if (error) throw error;
      return data;
    },
    enabled: !!targetUserId
  });
  
  const ratings = useQuery({
    queryKey: ['ratings', targetUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_ratings')
        .select('*')
        .eq('user_id', targetUserId);
      if (error) throw error;
      return data;
    },
    enabled: !!targetUserId
  });
  
  return {
    profile: profile.data,
    lists: lists.data,
    ratings: ratings.data,
    loading: profile.isLoading || lists.isLoading || ratings.isLoading,
    error: profile.error || lists.error || ratings.error
  };
}

/**
 * Unified list management hook
*/
export function useListManagement() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  const addToList = useMutation({
    mutationFn: async ({ 
      listId, 
      titleId, 
      status 
    }: { 
      listId: string; 
      titleId: string; 
      status?: string;
    }) => {
      const { error } = await supabase
        .from('user_list_items')
        .upsert({
          list_id: listId,
          title_id: titleId,
          user_status: status,
          added_at: new Date().toISOString()
        }, { onConflict: 'list_id,title_id' });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      toast.success('Added to list');
    },
    onError: () => {
      toast.error('Failed to add to list');
    }
  });
  
  const removeFromList = useMutation({
    mutationFn: async ({ 
      listId, 
      titleId 
    }: { 
      listId: string; 
      titleId: string;
    }) => {
      const { error } = await supabase
        .from('user_list_items')
        .delete()
        .eq('list_id', listId)
        .eq('title_id', titleId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      toast.success('Removed from list');
    },
    onError: () => {
      toast.error('Failed to remove from list');
    }
  });
  
  const createList = useMutation({
    mutationFn: async ({ 
      name, 
      description, 
      visibility = 'public' 
    }: { 
      name: string; 
      description?: string; 
      visibility?: string;
    }) => {
      const { data, error } = await supabase
        .from('user_lists')
        .insert({
          user_id: user?.id,
          name,
          description,
          visibility
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      toast.success('List created');
    },
    onError: () => {
      toast.error('Failed to create list');
    }
  });
  
  return {
    addToList,
    removeFromList,
    createList
  };
}

// ============= UTILITY HOOKS =============

/**
 * Generic form validation hook
*/
export function useValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: Record<keyof T, (value: any) => string | null>
) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<keyof T, string | null>>(
    {} as Record<keyof T, string | null>
  );
  const [touched, setTouched] = useState<Record<keyof T, boolean>>(
    {} as Record<keyof T, boolean>
  );
  
  const validate = useCallback((fieldName: keyof T) => {
    const rule = validationRules[fieldName];
    if (rule) {
      const error = rule(values[fieldName]);
      setErrors(prev => ({ ...prev, [fieldName]: error }));
      return !error;
    }
    return true;
  }, [values, validationRules]);
  
  const validateAll = useCallback(() => {
    let isValid = true;
    const newErrors = {} as Record<keyof T, string | null>;
    
    Object.keys(validationRules).forEach((key) => {
      const fieldName = key as keyof T;
      const error = validationRules[fieldName](values[fieldName]);
      newErrors[fieldName] = error;
      if (error) isValid = false;
    });
    
    setErrors(newErrors);
    return isValid;
  }, [values, validationRules]);
  
  const setValue = useCallback((fieldName: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  }, []);
  
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({} as Record<keyof T, string | null>);
    setTouched({} as Record<keyof T, boolean>);
  }, [initialValues]);
  
  return {
    values,
    errors,
    touched,
    setValue,
    validate,
    validateAll,
    reset,
    isValid: Object.values(errors).every(e => !e)
  };
}

/**
 * Generic local storage hook
*/
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });
  
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }, [key, storedValue]);
  
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  }, [key, initialValue]);
  
  return [storedValue, setValue, removeValue];
}

/**
 * Generic pagination hook
*/
export function usePagination(
  totalItems: number,
  itemsPerPage = 20,
  initialPage = 1
) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  
  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);
  
  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);
  
  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);
  
  return {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
}

// Re-export specific hooks for backwards compatibility
export { useContentDetail } from './useContentDetail';
export { useAuth } from './useAuth';
export { useToast } from './use-toast';