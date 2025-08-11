import { useState, memo, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  GripVertical, 
  Edit2, 
  Check, 
  X, 
  MoreHorizontal,
  Trash2,
  Plus,
  Minus
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { type UserTitleListEntry, type ListStatus } from '@/types/userLists';

interface SortableListItemProps {
  item: UserTitleListEntry;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onEdit: (id: string) => void;
  onSave: (id: string, updates: Partial<UserTitleListEntry>) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, statusId: string) => void;
  onProgressChange: (id: string, progress: number) => void;
  listStatuses: ListStatus[];
  maxProgress?: number;
}

const SortableListItemComponent = ({ 
  item, 
  isSelected, 
  isEditing, 
  onSelect, 
  onEdit, 
  onSave, 
  onCancel, 
  onDelete,
  onStatusChange,
  onProgressChange,
  listStatuses,
  maxProgress
}: SortableListItemProps) => {
  const [editValues, setEditValues] = useState({
    progress: item.progress || 0,
    rating: item.rating || 0,
    notes: item.notes || ''
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const currentStatus = useMemo(() => 
    listStatuses.find(s => s.id === item.status_id),
    [listStatuses, item.status_id]
  );
  
  const mediaTypeStatuses = useMemo(() => 
    listStatuses.filter(s => s.media_type === item.media_type || s.media_type === 'both'),
    [listStatuses, item.media_type]
  );

  const maxProgressValue = useMemo(() => {
    if (maxProgress) return maxProgress;
    if (item.media_type === 'anime') {
      return (item as any).anime_details?.episodes || 24;
    } else {
      return (item as any).manga_details?.chapters || 50;
    }
  }, [maxProgress, item.media_type, item]);

  const handleProgressIncrement = useCallback(() => {
    const newProgress = Math.min((item.progress || 0) + 1, maxProgressValue);
    onProgressChange(item.id, newProgress);
  }, [item.progress, maxProgressValue, onProgressChange, item.id]);

  const handleProgressDecrement = useCallback(() => {
    const newProgress = Math.max((item.progress || 0) - 1, 0);
    onProgressChange(item.id, newProgress);
  }, [item.progress, onProgressChange, item.id]);

  const handleSave = useCallback(() => {
    onSave(item.id, editValues);
    setEditValues({
      progress: item.progress || 0,
      rating: item.rating || 0,
      notes: item.notes || ''
    });
  }, [onSave, item.id, editValues, item.progress, item.rating, item.notes]);

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`transition-colors ${isSelected ? 'ring-2 ring-primary' : ''}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Selection checkbox */}
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(item.id, !!checked)}
          />
          
          {/* Drag handle */}
          <div 
            {...attributes} 
            {...listeners}
            className="cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">
                  {(item.title as any)?.title || `Title ${item.title_id}`}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {currentStatus?.label || 'Unknown'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {item.media_type}
                  </Badge>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={handleSave}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={onCancel}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => onEdit(item.id)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(item.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
            
            {/* Progress and Status Row */}
            <div className="flex items-center gap-3 mt-3">
              {/* Status Selector */}
              <div className="flex-1">
                {isEditing ? (
                  <Select 
                    value={item.status_id} 
                    onValueChange={(value) => onStatusChange(item.id, value)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mediaTypeStatuses.map(status => (
                        <SelectItem key={status.id} value={status.id}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Status: {currentStatus?.label}
                  </div>
                )}
              </div>
              
              {/* Progress Controls */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleProgressDecrement}
                  disabled={!item.progress || item.progress <= 0}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                
                {isEditing ? (
                  <Input
                    type="number"
                    value={editValues.progress}
                    onChange={(e) => setEditValues(prev => ({
                      ...prev,
                      progress: parseInt(e.target.value) || 0
                    }))}
                    className="w-20 h-8 text-center"
                    min={0}
                    max={maxProgressValue}
                  />
                ) : (
                  <span className="text-sm font-medium w-20 text-center">
                    {item.progress || 0} / {maxProgressValue}
                  </span>
                )}
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleProgressIncrement}
                  disabled={item.progress >= maxProgressValue}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            {/* Edit Mode: Rating and Notes */}
            {isEditing && (
              <div className="space-y-2 mt-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium w-16">Rating:</label>
                  <Input
                    type="number"
                    value={editValues.rating}
                    onChange={(e) => setEditValues(prev => ({
                      ...prev,
                      rating: parseFloat(e.target.value) || 0
                    }))}
                    className="w-20 h-8"
                    min={0}
                    max={10}
                    step={0.1}
                  />
                  <span className="text-sm text-muted-foreground">/ 10</span>
                </div>
                <div>
                  <label className="text-sm font-medium">Notes:</label>
                  <Input
                    value={editValues.notes}
                    onChange={(e) => setEditValues(prev => ({
                      ...prev,
                      notes: e.target.value
                    }))}
                    placeholder="Add your notes..."
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Memoize component for performance optimization
export const SortableListItem = memo(SortableListItemComponent);