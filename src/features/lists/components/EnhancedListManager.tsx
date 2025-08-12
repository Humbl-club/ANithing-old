import { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { 
  Download, 
  Upload, 
  Plus, 
  Filter,
  LayoutGrid,
  List as ListIcon,
  BarChart3,
  Share,
  Settings,
  RefreshCw,
  Eye,
  EyeOff,
  Heart,
  Pin,
  Star
} from 'lucide-react';
import { useListManagement } from '../hooks/useListManagement';
import { type EnhancedUserTitleListEntry, type ListStatus, type ListFilter, type ListSort } from '@/types/userLists';
import { toast } from 'sonner';
import { ListItem } from './ListItem';
import { ListFilters } from './ListFilters';
import { BulkActions } from './BulkActions';
import { cn } from '@/lib/utils';

interface EnhancedListManagerProps {
  contentType: 'anime' | 'manga' | 'both';
  listStatuses?: ListStatus[];
  showStats?: boolean;
  showImportExport?: boolean;
  showCustomLists?: boolean;
  showSharing?: boolean;
  compact?: boolean;
  initialView?: 'list' | 'grid';
}

export function EnhancedListManager({ 
  contentType,
  listStatuses: externalStatuses,
  showStats = true,
  showImportExport = true,
  showCustomLists = true,
  showSharing = true,
  compact = false,
  initialView = 'list'
}: EnhancedListManagerProps) {
  const {
    listItems,
    listStatuses,
    customLists,
    stats,
    isLoading,
    isReordering,
    error,
    addToList,
    updateListEntry,
    deleteListEntry,
    bulkUpdateListEntries,
    bulkDeleteListEntries,
    reorderListItems,
    importList,
    exportList,
    createCustomList,
    refetch
  } = useListManagement({ 
    contentType,
    enableOfflineSync: true,
    autoSave: true,
    optimisticUpdates: true
  });

  // Local state
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(initialView);
  const [showAdvancedControls, setShowAdvancedControls] = useState(true);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [activeFilters, setActiveFilters] = useState<ListFilter>({});
  const [sortConfig, setSortConfig] = useState<ListSort>({
    field: 'updated_at',
    direction: 'desc'
  });

  // Use external list statuses if provided, otherwise use hook's data
  const finalListStatuses = externalStatuses || listStatuses;

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filtering and sorting logic
  const filteredAndSortedItems = useMemo(() => {
    let filtered = [...(listItems as EnhancedUserTitleListEntry[])];

    // Apply search filter
    if (activeFilters.search) {
      filtered = filtered.filter(item =>
        (item.title as any)?.title?.toLowerCase().includes(activeFilters.search!.toLowerCase()) ||
        item.notes?.toLowerCase().includes(activeFilters.search!.toLowerCase()) ||
        item.tags?.some(tag => tag.toLowerCase().includes(activeFilters.search!.toLowerCase()))
      );
    }

    // Apply status filter
    if (activeFilters.status && activeFilters.status !== 'all') {
      filtered = filtered.filter(item => item.status_id === activeFilters.status);
    }

    // Apply media type filter
    if (activeFilters.mediaType && activeFilters.mediaType !== 'both') {
      filtered = filtered.filter(item => item.media_type === activeFilters.mediaType);
    }

    // Apply rating filter
    if (activeFilters.rating) {
      if (activeFilters.rating.min !== undefined) {
        filtered = filtered.filter(item => (item.score || 0) >= activeFilters.rating!.min!);
      }
      if (activeFilters.rating.max !== undefined) {
        filtered = filtered.filter(item => (item.score || 0) <= activeFilters.rating!.max!);
      }
    }

    // Apply progress filter
    if (activeFilters.progress) {
      if (activeFilters.progress.min !== undefined) {
        filtered = filtered.filter(item => (item.progress || 0) >= activeFilters.progress!.min!);
      }
      if (activeFilters.progress.max !== undefined) {
        filtered = filtered.filter(item => (item.progress || 0) <= activeFilters.progress!.max!);
      }
    }

    // Apply tags filter
    if (activeFilters.tags && activeFilters.tags.length > 0) {
      filtered = filtered.filter(item => 
        activeFilters.tags!.some(tag => item.tags?.includes(tag))
      );
    }

    // Apply date range filter
    if (activeFilters.dateRange) {
      if (activeFilters.dateRange.start) {
        filtered = filtered.filter(item => 
          new Date(item.created_at) >= new Date(activeFilters.dateRange!.start!)
        );
      }
      if (activeFilters.dateRange.end) {
        filtered = filtered.filter(item => 
          new Date(item.created_at) <= new Date(activeFilters.dateRange!.end!)
        );
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortConfig.field) {
        case 'title':
          aValue = (a.title as any)?.title || '';
          bValue = (b.title as any)?.title || '';
          break;
        case 'status':
          const statusA = finalListStatuses.find(s => s.id === a.status_id);
          const statusB = finalListStatuses.find(s => s.id === b.status_id);
          aValue = statusA?.label || '';
          bValue = statusB?.label || '';
          break;
        case 'progress':
          aValue = a.progress || 0;
          bValue = b.progress || 0;
          break;
        case 'rating':
          aValue = a.score || 0;
          bValue = b.score || 0;
          break;
        case 'updated_at':
          aValue = new Date(a.updated_at || 0);
          bValue = new Date(b.updated_at || 0);
          break;
        case 'created_at':
          aValue = new Date(a.created_at || 0);
          bValue = new Date(b.created_at || 0);
          break;
        case 'sort_order':
          aValue = a.sort_order || 0;
          bValue = b.sort_order || 0;
          break;
        default:
          aValue = a.updated_at || 0;
          bValue = b.updated_at || 0;
      }

      if (sortConfig.direction === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [listItems, activeFilters, sortConfig, finalListStatuses]);

  // Selection handlers
  const handleSelect = useCallback((id: string, selected: boolean) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedItems(new Set(filteredAndSortedItems.map(item => item.id)));
  }, [filteredAndSortedItems]);

  const handleDeselectAll = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  // Edit handlers
  const handleEdit = useCallback((id: string) => {
    setEditingItem(id);
  }, []);

  const handleSave = useCallback(async (id: string, updates: Partial<EnhancedUserTitleListEntry>) => {
    try {
      await updateListEntry(id, updates);
      setEditingItem(null);
      toast.success('List entry updated successfully');
    } catch (error) {
      toast.error('Failed to update list entry');
    }
  }, [updateListEntry]);

  const handleCancel = useCallback(() => {
    setEditingItem(null);
  }, []);

  // Delete handler
  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteListEntry(id);
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      toast.success('List entry deleted');
    } catch (error) {
      toast.error('Failed to delete list entry');
    }
  }, [deleteListEntry]);

  // Status change handler
  const handleStatusChange = useCallback(async (id: string, statusId: string) => {
    try {
      await updateListEntry(id, { status_id: statusId });
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  }, [updateListEntry]);

  // Progress change handler
  const handleProgressChange = useCallback(async (id: string, progress: number) => {
    try {
      await updateListEntry(id, { progress });
      toast.success(`Progress updated to ${progress}`);
    } catch (error) {
      toast.error('Failed to update progress');
    }
  }, [updateListEntry]);

  // Rating change handler
  const handleRatingChange = useCallback(async (id: string, rating: number) => {
    try {
      await updateListEntry(id, { score: rating });
      toast.success(`Rating updated to ${rating}`);
    } catch (error) {
      toast.error('Failed to update rating');
    }
  }, [updateListEntry]);

  // Toggle handlers
  const handleToggleFavorite = useCallback(async (id: string, isFavorite: boolean) => {
    try {
      await updateListEntry(id, { is_favorite: isFavorite });
      toast.success(isFavorite ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
      toast.error('Failed to update favorite status');
    }
  }, [updateListEntry]);

  const handleTogglePrivate = useCallback(async (id: string, isPrivate: boolean) => {
    try {
      await updateListEntry(id, { is_private: isPrivate });
      toast.success(isPrivate ? 'Made private' : 'Made public');
    } catch (error) {
      toast.error('Failed to update privacy');
    }
  }, [updateListEntry]);

  const handleTogglePin = useCallback(async (id: string, isPinned: boolean) => {
    try {
      await updateListEntry(id, { is_pinned: isPinned });
      toast.success(isPinned ? 'Pinned item' : 'Unpinned item');
    } catch (error) {
      toast.error('Failed to update pin status');
    }
  }, [updateListEntry]);

  // Tag handlers
  const handleAddTag = useCallback(async (id: string, tag: string) => {
    const item = listItems.find(item => item.id === id) as EnhancedUserTitleListEntry;
    if (!item) return;
    
    const newTags = [...(item.tags || []), tag];
    try {
      await updateListEntry(id, { tags: newTags });
      toast.success('Tag added');
    } catch (error) {
      toast.error('Failed to add tag');
    }
  }, [listItems, updateListEntry]);

  const handleRemoveTag = useCallback(async (id: string, tag: string) => {
    const item = listItems.find(item => item.id === id) as EnhancedUserTitleListEntry;
    if (!item) return;
    
    const newTags = (item.tags || []).filter(t => t !== tag);
    try {
      await updateListEntry(id, { tags: newTags });
      toast.success('Tag removed');
    } catch (error) {
      toast.error('Failed to remove tag');
    }
  }, [listItems, updateListEntry]);

  // Bulk actions
  const handleBulkStatusChange = useCallback(async (statusId: string) => {
    const selectedIds = Array.from(selectedItems);
    if (selectedIds.length === 0) return;

    try {
      await bulkUpdateListEntries(selectedIds, { status_id: statusId });
      const status = finalListStatuses.find(s => s.id === statusId);
      toast.success(`Updated ${selectedIds.length} items to "${status?.label}"`);
      setSelectedItems(new Set());
    } catch (error) {
      toast.error('Failed to update selected items');
    }
  }, [selectedItems, bulkUpdateListEntries, finalListStatuses]);

  const handleBulkDelete = useCallback(async () => {
    const selectedIds = Array.from(selectedItems);
    if (selectedIds.length === 0) return;

    try {
      await bulkDeleteListEntries(selectedIds);
      toast.success(`Deleted ${selectedIds.length} items`);
      setSelectedItems(new Set());
    } catch (error) {
      toast.error('Failed to delete selected items');
    }
  }, [selectedItems, bulkDeleteListEntries]);

  // Drag end handler
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = filteredAndSortedItems.findIndex(item => item.id === active.id);
      const newIndex = filteredAndSortedItems.findIndex(item => item.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedItems = arrayMove(filteredAndSortedItems, oldIndex, newIndex);
        reorderListItems(reorderedItems.map(item => item.id));
        toast.success('List reordered');
      }
    }
  }, [filteredAndSortedItems, reorderListItems]);

  // Import/Export handlers
  const handleExportList = useCallback(async (format: 'json' | 'csv' = 'json') => {
    try {
      const exportData = await exportList(format);
      
      // Create download link
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: format === 'json' ? 'application/json' : 'text/csv'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `my-${contentType}-list.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('List exported successfully');
    } catch (error) {
      toast.error('Failed to export list');
    }
  }, [exportList, contentType]);

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-destructive mb-4">Error loading list: {error}</p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your list...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My {contentType === 'both' ? 'Anime & Manga' : contentType} List</h2>
          <p className="text-muted-foreground">
            {stats.total} items • Average rating: {stats.averageRating.toFixed(1)}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <ListIcon className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>

          {/* Action buttons */}
          {showImportExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportList('json')}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Settings */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="advanced-controls"
                  checked={showAdvancedControls}
                  onCheckedChange={setShowAdvancedControls}
                />
                <label htmlFor="advanced-controls" className="text-sm">
                  Advanced controls
                </label>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  id="thumbnails"
                  checked={showThumbnails}
                  onCheckedChange={setShowThumbnails}
                />
                <label htmlFor="thumbnails" className="text-sm">
                  Show thumbnails
                </label>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedItems.size > 0 && (
        <BulkActions
          selectedCount={selectedItems.size}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onBulkStatusChange={handleBulkStatusChange}
          onBulkDelete={handleBulkDelete}
          listStatuses={finalListStatuses}
          contentType={contentType}
          isAllSelected={selectedItems.size === filteredAndSortedItems.length && filteredAndSortedItems.length > 0}
        />
      )}

      {/* List Items */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={filteredAndSortedItems.map(item => item.id)} 
          strategy={verticalListSortingStrategy}
        >
          <div className={cn(
            'gap-3',
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'space-y-3'
          )}>
            {filteredAndSortedItems.map(item => (
              <ListItem
                key={item.id}
                item={item as EnhancedUserTitleListEntry}
                isSelected={selectedItems.has(item.id)}
                isEditing={editingItem === item.id}
                onSelect={handleSelect}
                onEdit={handleEdit}
                onSave={handleSave}
                onCancel={handleCancel}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                onProgressChange={handleProgressChange}
                onRatingChange={handleRatingChange}
                onToggleFavorite={handleToggleFavorite}
                onTogglePrivate={handleTogglePrivate}
                onTogglePin={handleTogglePin}
                onAddTag={handleAddTag}
                onRemoveTag={handleRemoveTag}
                listStatuses={finalListStatuses}
                showAdvancedControls={showAdvancedControls}
                showThumbnail={showThumbnails}
                compact={compact || viewMode === 'grid'}
                disabled={isReordering}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Empty State */}
      {filteredAndSortedItems.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto w-24 h-24 mb-4 rounded-full bg-muted flex items-center justify-center">
              <ListIcon className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              {activeFilters.search || activeFilters.status !== 'all' || Object.keys(activeFilters).length > 0
                ? `No ${contentType} match your filters`
                : `Your ${contentType} list is empty`
              }
            </h3>
            <p className="text-muted-foreground mb-4">
              {activeFilters.search || activeFilters.status !== 'all' || Object.keys(activeFilters).length > 0
                ? 'Try adjusting your filters to see more results.'
                : `Start building your ${contentType} collection by adding titles you're interested in.`
              }
            </p>
            {Object.keys(activeFilters).length > 0 && (
              <Button
                variant="outline"
                onClick={() => setActiveFilters({})}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}