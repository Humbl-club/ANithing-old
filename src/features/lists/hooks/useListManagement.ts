import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { 
  UserTitleListEntry, 
  ListStatus, 
  CustomList, 
  CustomListItem, 
  ListImportData, 
  ListExportData,
  BulkListOperation 
} from '@/types/userLists';

interface ListManagementOptions {
  contentType?: 'anime' | 'manga' | 'both';
  enableOfflineSync?: boolean;
  autoSave?: boolean;
  optimisticUpdates?: boolean;
}

export const useListManagement = (options: ListManagementOptions = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const {
    contentType = 'both',
    enableOfflineSync = true,
    autoSave = true,
    optimisticUpdates = true
  } = options;

  // ===== STATE =====
  const [pendingOperations, setPendingOperations] = useState<Map<string, any>>(new Map());
  const [isReordering, setIsReordering] = useState(false);

  // ===== QUERIES =====
  
  // Fetch user's main lists
  const { 
    data: listItems = [], 
    isLoading: isLoadingItems, 
    error: itemsError,
    refetch: refetchItems 
  } = useQuery({
    queryKey: ['user-list-items', user?.id, contentType],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      let query = supabase
        .from('user_lists')
        .select(`
          *,
          title:titles(*),
          status:list_statuses(*),
          anime_details:anime_details(*),
          manga_details:manga_details(*)
        `)
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true });

      if (contentType !== 'both') {
        query = query.eq('media_type', contentType);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return data as unknown as UserTitleListEntry[];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch list statuses
  const { 
    data: listStatuses = [], 
    isLoading: isLoadingStatuses 
  } = useQuery({
    queryKey: ['list-statuses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('list_statuses')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data as ListStatus[];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  // Fetch user's custom lists
  const { 
    data: customLists = [], 
    isLoading: isLoadingCustomLists 
  } = useQuery({
    queryKey: ['custom-lists', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('custom_lists')
        .select(`
          *,
          list_type:custom_list_types(*),
          items:custom_list_items(
            *,
            title:titles(*)
          )
        `)
        .eq('user_id', user.id)
        .order('sort_order');

      if (error) throw error;
      return data as CustomList[];
    },
    enabled: !!user?.id,
  });

  // ===== MUTATIONS =====

  // Add item to list
  const addToListMutation = useMutation({
    mutationFn: async ({ titleId, statusId, mediaType, customData }: {
      titleId: string;
      statusId: string;
      mediaType: 'anime' | 'manga';
      customData?: Partial<UserTitleListEntry>;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_lists')
        .insert({
          user_id: user.id,
          title_id: titleId,
          status_id: statusId,
          media_type: mediaType,
          sort_order: listItems.length,
          ...customData
        })
        .select(`
          *,
          title:titles(*),
          status:list_statuses(*),
          anime_details:anime_details(*),
          manga_details:manga_details(*)
        `)
        .single();

      if (error) throw error;
      return data as unknown as UserTitleListEntry;
    },
    onMutate: async (variables) => {
      if (!optimisticUpdates) return;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['user-list-items', user?.id, contentType] });

      // Snapshot previous value
      const previousItems = queryClient.getQueryData<UserTitleListEntry[]>(
        ['user-list-items', user?.id, contentType]
      );

      // Optimistically update
      if (previousItems) {
        const optimisticItem = {
          id: `temp-${Date.now()}`,
          user_id: user!.id,
          title_id: variables.titleId,
          status_id: variables.statusId,
          media_type: variables.mediaType,
          sort_order: previousItems.length,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...variables.customData
        } as UserTitleListEntry;

        queryClient.setQueryData(
          ['user-list-items', user?.id, contentType],
          [...previousItems, optimisticItem]
        );
      }

      return { previousItems };
    },
    onError: (err, variables, context) => {
      // Revert optimistic update
      if (context?.previousItems) {
        queryClient.setQueryData(
          ['user-list-items', user?.id, contentType],
          context.previousItems
        );
      }
      toast.error('Failed to add item to list');
    },
    onSuccess: () => {
      toast.success('Added to list successfully');
      queryClient.invalidateQueries({ queryKey: ['user-list-items', user?.id, contentType] });
    }
  });

  // Update list entry
  const updateListEntryMutation = useMutation({
    mutationFn: async ({ id, updates }: {
      id: string;
      updates: Partial<UserTitleListEntry>;
    }) => {
      const { data, error } = await supabase
        .from('user_lists')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          title:titles(*),
          status:list_statuses(*),
          anime_details:anime_details(*),
          manga_details:manga_details(*)
        `)
        .single();

      if (error) throw error;
      return data as unknown as UserTitleListEntry;
    },
    onMutate: async (variables) => {
      if (!optimisticUpdates) return;

      await queryClient.cancelQueries({ queryKey: ['user-list-items', user?.id, contentType] });

      const previousItems = queryClient.getQueryData<UserTitleListEntry[]>(
        ['user-list-items', user?.id, contentType]
      );

      if (previousItems) {
        const updatedItems = previousItems.map(item =>
          item.id === variables.id 
            ? { ...item, ...variables.updates, updated_at: new Date().toISOString() }
            : item
        );
        
        queryClient.setQueryData(
          ['user-list-items', user?.id, contentType],
          updatedItems
        );
      }

      return { previousItems };
    },
    onError: (err, variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(
          ['user-list-items', user?.id, contentType],
          context.previousItems
        );
      }
      toast.error('Failed to update list entry');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-list-items', user?.id, contentType] });
    }
  });

  // Delete list entry
  const deleteListEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('user_lists')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onMutate: async (id) => {
      if (!optimisticUpdates) return;

      await queryClient.cancelQueries({ queryKey: ['user-list-items', user?.id, contentType] });

      const previousItems = queryClient.getQueryData<UserTitleListEntry[]>(
        ['user-list-items', user?.id, contentType]
      );

      if (previousItems) {
        const filteredItems = previousItems.filter(item => item.id !== id);
        queryClient.setQueryData(
          ['user-list-items', user?.id, contentType],
          filteredItems
        );
      }

      return { previousItems };
    },
    onError: (err, id, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(
          ['user-list-items', user?.id, contentType],
          context.previousItems
        );
      }
      toast.error('Failed to delete list entry');
    },
    onSuccess: () => {
      toast.success('Removed from list');
      queryClient.invalidateQueries({ queryKey: ['user-list-items', user?.id, contentType] });
    }
  });

  // Bulk operations
  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, updates }: BulkListOperation) => {
      const { data, error } = await supabase.rpc('bulk_update_user_list_items', {
        item_ids: ids,
        update_data: updates
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      toast.success(`Updated ${variables.ids.length} items`);
      queryClient.invalidateQueries({ queryKey: ['user-list-items', user?.id, contentType] });
    },
    onError: () => {
      toast.error('Failed to perform bulk update');
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('user_lists')
        .delete()
        .in('id', ids);

      if (error) throw error;
      return ids;
    },
    onSuccess: (ids) => {
      toast.success(`Deleted ${ids.length} items`);
      queryClient.invalidateQueries({ queryKey: ['user-list-items', user?.id, contentType] });
    },
    onError: () => {
      toast.error('Failed to delete selected items');
    }
  });

  // Reorder items
  const reorderItemsMutation = useMutation({
    mutationFn: async (itemIds: string[]) => {
      const updates = itemIds.map((id, index) => ({
        id,
        sort_order: index
      }));

      const { error } = await supabase.rpc('bulk_update_list_sort_order', {
        updates
      });

      if (error) throw error;
      return updates;
    },
    onMutate: async (itemIds) => {
      setIsReordering(true);

      if (!optimisticUpdates) return;

      await queryClient.cancelQueries({ queryKey: ['user-list-items', user?.id, contentType] });

      const previousItems = queryClient.getQueryData<UserTitleListEntry[]>(
        ['user-list-items', user?.id, contentType]
      );

      if (previousItems) {
        const reorderedItems = itemIds.map((id, index) => {
          const item = previousItems.find(item => item.id === id);
          return item ? { ...item, sort_order: index } : null;
        }).filter(Boolean) as UserTitleListEntry[];

        queryClient.setQueryData(
          ['user-list-items', user?.id, contentType],
          reorderedItems
        );
      }

      return { previousItems };
    },
    onError: (err, variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(
          ['user-list-items', user?.id, contentType],
          context.previousItems
        );
      }
      toast.error('Failed to reorder items');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-list-items', user?.id, contentType] });
    },
    onSettled: () => {
      setIsReordering(false);
    }
  });

  // Import list
  const importListMutation = useMutation({
    mutationFn: async (importData: ListImportData) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('import_user_list', {
        user_id: user.id,
        import_data: importData
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (result) => {
      toast.success(`Imported ${result.success_count} items successfully`);
      if (result.error_count > 0) {
        toast.warning(`${result.error_count} items failed to import`);
      }
      queryClient.invalidateQueries({ queryKey: ['user-list-items', user?.id, contentType] });
    },
    onError: () => {
      toast.error('Failed to import list');
    }
  });

  // Export list
  const exportList = useCallback(async (format: 'json' | 'csv' = 'json'): Promise<ListExportData> => {
    if (!user?.id) throw new Error('User not authenticated');

    const { data, error } = await supabase.rpc('export_user_list', {
      user_id: user.id,
      content_type: contentType,
      export_format: format
    });

    if (error) throw error;
    return data as ListExportData;
  }, [user?.id, contentType]);

  // Create custom list
  const createCustomListMutation = useMutation({
    mutationFn: async ({ name, description, isPublic }: {
      name: string;
      description?: string;
      isPublic?: boolean;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('custom_lists')
        .insert({
          user_id: user.id,
          name,
          description,
          is_public: isPublic || false,
          sort_order: customLists.length
        })
        .select('*')
        .single();

      if (error) throw error;
      return data as CustomList;
    },
    onSuccess: () => {
      toast.success('Custom list created');
      queryClient.invalidateQueries({ queryKey: ['custom-lists', user?.id] });
    },
    onError: () => {
      toast.error('Failed to create custom list');
    }
  });

  // ===== COMPUTED VALUES =====
  
  const isLoading = isLoadingItems || isLoadingStatuses || isLoadingCustomLists;
  const error = itemsError;

  const filteredStatuses = useMemo(() => {
    if (contentType === 'both') return listStatuses;
    return listStatuses.filter(status => 
      status.media_type === contentType || status.media_type === 'both'
    );
  }, [listStatuses, contentType]);

  const stats = useMemo(() => {
    const statusCounts = filteredStatuses.reduce((acc, status) => {
      acc[status.id] = listItems.filter(item => item.status_id === status.id).length;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: listItems.length,
      statusCounts,
      averageRating: listItems.reduce((sum, item) => sum + (item.score || 0), 0) / listItems.length || 0,
      totalHours: listItems.reduce((sum, item) => {
        if (item.media_type === 'anime' && item.episodes_watched) {
          return sum + (item.episodes_watched * 24); // Assuming 24min per episode
        }
        return sum;
      }, 0) / 60 // Convert to hours
    };
  }, [listItems, filteredStatuses]);

  // ===== PUBLIC API =====
  
  const addToList = useCallback(async (
    titleId: string, 
    statusId: string, 
    mediaType: 'anime' | 'manga',
    customData?: Partial<UserTitleListEntry>
  ) => {
    return addToListMutation.mutateAsync({ titleId, statusId, mediaType, customData });
  }, [addToListMutation]);

  const updateListEntry = useCallback(async (
    id: string, 
    updates: Partial<UserTitleListEntry>
  ) => {
    return updateListEntryMutation.mutateAsync({ id, updates });
  }, [updateListEntryMutation]);

  const deleteListEntry = useCallback(async (id: string) => {
    return deleteListEntryMutation.mutateAsync(id);
  }, [deleteListEntryMutation]);

  const bulkUpdateListEntries = useCallback(async (
    ids: string[], 
    updates: Partial<UserTitleListEntry>
  ) => {
    return bulkUpdateMutation.mutateAsync({ ids, updates });
  }, [bulkUpdateMutation]);

  const bulkDeleteListEntries = useCallback(async (ids: string[]) => {
    return bulkDeleteMutation.mutateAsync(ids);
  }, [bulkDeleteMutation]);

  const reorderListItems = useCallback(async (itemIds: string[]) => {
    return reorderItemsMutation.mutateAsync(itemIds);
  }, [reorderItemsMutation]);

  const importList = useCallback(async (importData: ListImportData) => {
    return importListMutation.mutateAsync(importData);
  }, [importListMutation]);

  const createCustomList = useCallback(async (
    name: string, 
    description?: string, 
    isPublic?: boolean
  ) => {
    return createCustomListMutation.mutateAsync({ name, description, isPublic });
  }, [createCustomListMutation]);

  return {
    // Data
    listItems,
    listStatuses: filteredStatuses,
    customLists,
    stats,

    // Loading states
    isLoading,
    isReordering,
    error,

    // Mutations
    addToList,
    updateListEntry,
    deleteListEntry,
    bulkUpdateListEntries,
    bulkDeleteListEntries,
    reorderListItems,
    importList,
    exportList,
    createCustomList,

    // Utilities
    refetch: refetchItems,
    pendingOperations,

    // Loading states for specific operations
    isAddingToList: addToListMutation.isPending,
    isUpdating: updateListEntryMutation.isPending,
    isDeleting: deleteListEntryMutation.isPending,
    isBulkUpdating: bulkUpdateMutation.isPending,
    isBulkDeleting: bulkDeleteMutation.isPending,
    isImporting: importListMutation.isPending,
    isCreatingCustomList: createCustomListMutation.isPending
  };
};