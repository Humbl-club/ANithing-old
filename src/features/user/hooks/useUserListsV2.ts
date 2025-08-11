import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataService } from '@/core/services/DataService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
/**
 * Unified user lists hook using DataService
 * Replaces useUserLists and useUserTitleLists
*/
export function useUserLists() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;
  // Fetch user lists
  const { data: lists, isLoading, error } = useQuery({
    queryKey: ['user-lists', userId],
    queryFn: () => dataService.getUserLists(userId!),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000
  });
  // Add to list mutation
  const addToList = useMutation({
    mutationFn: ({
      titleId,
      statusId,
      score
    }: {
      titleId: string;
      statusId: string;
      score?: number;
    }) => {
      if (!userId) throw new Error('User not authenticated');
      return dataService.addToList(userId, titleId, statusId, score);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-lists', userId] });
      toast({
        title: 'Added to list',
        description: 'Title has been added to your list'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add to list',
        variant: 'destructive'
      });
    }
  });
  // Update list item mutation
  const updateListItem = useMutation({
    mutationFn: ({
      listItemId,
      updates
    }: {
      listItemId: string;
      updates: Parameters<typeof dataService.updateListItem>[1];
    }) => {
      return dataService.updateListItem(listItemId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-lists', userId] });
      toast({
        title: 'Updated',
        description: 'Your list has been updated'
      });
    }
  });
  // Remove from list mutation
  const removeFromList = useMutation({
    mutationFn: (titleId: string) => {
      if (!userId) throw new Error('User not authenticated');
      return dataService.removeFromList(userId, titleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-lists', userId] });
      toast({
        title: 'Removed',
        description: 'Title has been removed from your list'
      });
    }
  });
  return {
    lists: lists || [],
    isLoading,
    error: error as Error | null,
    addToList: addToList.mutate,
    updateListItem: updateListItem.mutate,
    removeFromList: removeFromList.mutate,
    isAddingToList: addToList.isPending,
    isUpdating: updateListItem.isPending,
    isRemoving: removeFromList.isPending
  };
}