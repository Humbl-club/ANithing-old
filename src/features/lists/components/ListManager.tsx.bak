import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
import { useUserTitleLists } from '@/hooks/useUserTitleLists';
import { useBackgroundSync } from '@/hooks/useBackgroundSync';
import { type UserTitleListEntry, type ListStatus } from '@/types/userLists';
import { toast } from 'sonner';
import { SortableListItem } from './SortableListItem';
import { ListFilters } from './ListFilters';
import { BulkActions } from './BulkActions';

interface ListManagerRefactoredProps {
  contentType: 'anime' | 'manga' | 'both';
  listStatuses: ListStatus[];
}

export function ListManagerRefactored({ contentType, listStatuses }: ListManagerRefactoredProps) {
  const {
    listItems,
    isLoading,
    updateListEntry,
    deleteListEntry,
    bulkUpdateListEntries,
    bulkDeleteListEntries,
    reorderListItems
  } = useUserTitleLists(contentType);
  
  const { syncInProgress } = useBackgroundSync();

  // Local state
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filtering and sorting logic
  const filteredItems = useMemo(() => {
    let filtered = [...listItems];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        (item.title as any)?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status_id === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'title':
          aValue = (a.title as any)?.title || '';
          bValue = (b.title as any)?.title || '';
          break;
        case 'status':
          aValue = listStatuses.find(s => s.id === a.status_id)?.label || '';
          bValue = listStatuses.find(s => s.id === b.status_id)?.label || '';
          break;
        case 'progress':
          aValue = a.progress || 0;
          bValue = b.progress || 0;
          break;
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case 'updated_at':
          aValue = new Date(a.updated_at || 0);
          bValue = new Date(b.updated_at || 0);
          break;
        case 'added_at':
          aValue = new Date(a.created_at || 0);
          bValue = new Date(b.created_at || 0);
          break;
        default:
          aValue = a.updated_at || 0;
          bValue = b.updated_at || 0;
      }

      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [listItems, searchTerm, statusFilter, sortBy, sortOrder, listStatuses]);

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
    setSelectedItems(new Set(filteredItems.map(item => item.id)));
  }, [filteredItems]);

  const handleDeselectAll = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  // Edit handlers
  const handleEdit = useCallback((id: string) => {
    setEditingItem(id);
  }, []);

  const handleSave = useCallback(async (id: string, updates: Partial<UserTitleListEntry>) => {
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

  // Bulk actions
  const handleBulkStatusChange = useCallback(async (statusId: string) => {
    const selectedIds = Array.from(selectedItems);
    if (selectedIds.length === 0) return;

    try {
      await bulkUpdateListEntries(selectedIds, { status_id: statusId });
      const status = listStatuses.find(s => s.id === statusId);
      toast.success(`Updated ${selectedIds.length} items to "${status?.label}"`);
      setSelectedItems(new Set());
    } catch (error) {
      toast.error('Failed to update selected items');
    }
  }, [selectedItems, bulkUpdateListEntries, listStatuses]);

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
      const oldIndex = filteredItems.findIndex(item => item.id === active.id);
      const newIndex = filteredItems.findIndex(item => item.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedItems = arrayMove(filteredItems, oldIndex, newIndex);
        reorderListItems(reorderedItems.map(item => item.id));
        toast.success('List reordered');
      }
    }
  }, [filteredItems, reorderListItems]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Loading your list...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <ListFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        listStatuses={listStatuses}
        contentType={contentType}
        totalItems={listItems.length}
        filteredCount={filteredItems.length}
      />

      {/* Bulk Actions */}
      <BulkActions
        selectedCount={selectedItems.size}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onBulkStatusChange={handleBulkStatusChange}
        onBulkDelete={handleBulkDelete}
        listStatuses={listStatuses}
        contentType={contentType}
        isAllSelected={selectedItems.size === filteredItems.length && filteredItems.length > 0}
      />

      {/* List Items */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={filteredItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {filteredItems.map(item => (
              <SortableListItem
                key={item.id}
                item={item}
                isSelected={selectedItems.has(item.id)}
                isEditing={editingItem === item.id}
                onSelect={handleSelect}
                onEdit={handleEdit}
                onSave={handleSave}
                onCancel={handleCancel}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                onProgressChange={handleProgressChange}
                listStatuses={listStatuses}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all'
                ? `No ${contentType} match your filters.`
                : `No ${contentType} in your list yet. Start adding some!`
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}