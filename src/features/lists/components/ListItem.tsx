import { useState, memo, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Minus,
  Star,
  Heart,
  Eye,
  EyeOff,
  Pin,
  PinOff,
  ExternalLink,
  MessageSquare,
  Calendar,
  Clock,
  Target
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { type EnhancedUserTitleListEntry, type ListStatus } from '@/types/userLists';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ListItemProps {
  item: EnhancedUserTitleListEntry;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onEdit: (id: string) => void;
  onSave: (id: string, updates: Partial<EnhancedUserTitleListEntry>) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, statusId: string) => void;
  onProgressChange: (id: string, progress: number) => void;
  onRatingChange: (id: string, rating: number) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onTogglePrivate: (id: string, isPrivate: boolean) => void;
  onTogglePin: (id: string, isPinned: boolean) => void;
  onAddTag: (id: string, tag: string) => void;
  onRemoveTag: (id: string, tag: string) => void;
  listStatuses: ListStatus[];
  maxProgress?: number;
  showAdvancedControls?: boolean;
  showThumbnail?: boolean;
  compact?: boolean;
  disabled?: boolean;
}

const ListItemComponent = ({ 
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
  onRatingChange,
  onToggleFavorite,
  onTogglePrivate,
  onTogglePin,
  onAddTag,
  onRemoveTag,
  listStatuses,
  maxProgress,
  showAdvancedControls = true,
  showThumbnail = true,
  compact = false,
  disabled = false
}: ListItemProps) => {
  const [editValues, setEditValues] = useState({
    progress: item.progress || 0,
    score: item.score || 0,
    notes: item.notes || '',
    tags: item.tags || [],
    start_date: item.start_date || '',
    finish_date: item.finish_date || '',
    priority: item.priority || 0,
    custom_status: item.custom_status || ''
  });

  const [newTag, setNewTag] = useState('');
  const [showFullNotes, setShowFullNotes] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const noteInputRef = useRef<HTMLTextAreaElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: item.id,
    disabled: disabled || isEditing
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
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
  }, [maxProgress, item]);

  const progressPercentage = useMemo(() => {
    if (!maxProgressValue || maxProgressValue === 0) return 0;
    return Math.min((item.progress || 0) / maxProgressValue * 100, 100);
  }, [item.progress, maxProgressValue]);

  const handleProgressIncrement = useCallback(() => {
    const newProgress = Math.min((item.progress || 0) + 1, maxProgressValue);
    onProgressChange(item.id, newProgress);
  }, [item.progress, maxProgressValue, onProgressChange, item.id]);

  const handleProgressDecrement = useCallback(() => {
    const newProgress = Math.max((item.progress || 0) - 1, 0);
    onProgressChange(item.id, newProgress);
  }, [item.progress, onProgressChange, item.id]);

  const handleQuickRating = useCallback((rating: number) => {
    onRatingChange(item.id, rating);
  }, [onRatingChange, item.id]);

  const handleSave = useCallback(() => {
    onSave(item.id, editValues);
    setEditValues({
      progress: item.progress || 0,
      score: item.score || 0,
      notes: item.notes || '',
      tags: item.tags || [],
      start_date: item.start_date || '',
      finish_date: item.finish_date || '',
      priority: item.priority || 0,
      custom_status: item.custom_status || ''
    });
  }, [onSave, item, editValues]);

  const handleAddTag = useCallback(() => {
    if (newTag.trim() && !item.tags.includes(newTag.trim())) {
      onAddTag(item.id, newTag.trim());
      setNewTag('');
    }
  }, [newTag, item.tags, onAddTag, item.id]);

  const handleRemoveTag = useCallback((tag: string) => {
    onRemoveTag(item.id, tag);
  }, [onRemoveTag, item.id]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (e.currentTarget === noteInputRef.current) return; // Allow Enter in notes
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  }, [handleSave, onCancel]);

  const titleInfo = item.title as any;
  const coverImage = titleInfo?.cover_image || titleInfo?.image || '/placeholder.svg';

  return (
    <TooltipProvider>
      <Card 
        ref={setNodeRef} 
        style={style} 
        className={cn(
          'transition-all duration-200 hover:shadow-md',
          isSelected && 'ring-2 ring-primary shadow-lg',
          isDragging && 'shadow-2xl scale-105',
          item.is_pinned && 'border-l-4 border-l-yellow-500',
          item.is_favorite && 'border-t-2 border-t-red-500',
          compact && 'py-2',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onKeyDown={handleKeyPress}
        tabIndex={isEditing ? -1 : 0}
      >
        <CardContent className={cn('p-4', compact && 'py-2')}>
          <div className="flex items-start gap-3">
            {/* Selection checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onSelect(item.id, !!checked)}
                disabled={disabled}
              />
              
              {/* Drag handle */}
              {!disabled && (
                <div 
                  {...attributes} 
                  {...listeners}
                  className="cursor-grab active:cursor-grabbing hover:bg-muted rounded p-1 transition-colors"
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
            
            {/* Thumbnail */}
            {showThumbnail && !compact && (
              <div className="flex-shrink-0 w-16 h-20 rounded-md overflow-hidden bg-muted">
                <img
                  src={coverImage}
                  alt={titleInfo?.title || 'Cover'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>
            )}
            
            {/* Main content */}
            <div className="flex-1 min-w-0 space-y-3">
              {/* Header row */}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={cn(
                      'font-medium truncate',
                      compact ? 'text-sm' : 'text-base'
                    )}>
                      {titleInfo?.title || `Title ${item.title_id}`}
                    </h4>
                    
                    {/* Status indicators */}
                    <div className="flex items-center gap-1">
                      {item.is_pinned && (
                        <Pin className="w-3 h-3 text-yellow-500" />
                      )}
                      {item.is_favorite && (
                        <Heart className="w-3 h-3 text-red-500 fill-current" />
                      )}
                      {item.is_private && (
                        <EyeOff className="w-3 h-3 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {currentStatus?.label || 'Unknown'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {item.media_type}
                    </Badge>
                    {item.score && (
                      <Badge variant="outline" className="text-xs">
                        ⭐ {item.score}
                      </Badge>
                    )}
                    {item.priority > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <Target className="w-3 h-3 mr-1" />
                        P{item.priority}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-1">
                  {isEditing ? (
                    <>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={handleSave}
                        disabled={disabled}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={onCancel}
                        disabled={disabled}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      {/* Quick rating */}
                      {showAdvancedControls && !compact && (
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              onClick={() => handleQuickRating(rating * 2)}
                              className={cn(
                                'w-4 h-4 text-yellow-500 hover:scale-110 transition-transform',
                                (item.score || 0) >= rating * 2 ? 'fill-current' : ''
                              )}
                              disabled={disabled}
                            >
                              <Star className="w-4 h-4" />
                            </button>
                          ))}
                        </div>
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" disabled={disabled}>
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(item.id)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onToggleFavorite(item.id, !item.is_favorite)}
                          >
                            <Heart className={cn(
                              'w-4 h-4 mr-2',
                              item.is_favorite && 'fill-current text-red-500'
                            )} />
                            {item.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onTogglePin(item.id, !item.is_pinned)}
                          >
                            {item.is_pinned ? (
                              <PinOff className="w-4 h-4 mr-2" />
                            ) : (
                              <Pin className="w-4 h-4 mr-2" />
                            )}
                            {item.is_pinned ? 'Unpin' : 'Pin'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onTogglePrivate(item.id, !item.is_private)}
                          >
                            {item.is_private ? (
                              <Eye className="w-4 h-4 mr-2" />
                            ) : (
                              <EyeOff className="w-4 h-4 mr-2" />
                            )}
                            {item.is_private ? 'Make Public' : 'Make Private'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => onDelete(item.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}
                </div>
              </div>
              
              {/* Progress section */}
              {!compact && (
                <div className="space-y-2">
                  {/* Progress bar */}
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={progressPercentage} 
                      className="flex-1 h-2"
                    />
                    <span className="text-xs text-muted-foreground min-w-0">
                      {item.progress || 0} / {maxProgressValue}
                    </span>
                  </div>
                  
                  {/* Progress controls */}
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Select 
                          value={item.status_id} 
                          onValueChange={(value) => onStatusChange(item.id, value)}
                          disabled={disabled}
                        >
                          <SelectTrigger className="h-8 flex-1">
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
                        
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleProgressDecrement}
                            disabled={disabled || !item.progress || item.progress <= 0}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          
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
                            disabled={disabled}
                          />
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleProgressIncrement}
                            disabled={disabled || item.progress >= maxProgressValue}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm text-muted-foreground">
                          Status: {currentStatus?.label}
                        </div>
                        
                        <div className="flex items-center gap-1 ml-auto">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleProgressDecrement}
                            disabled={disabled || !item.progress || item.progress <= 0}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleProgressIncrement}
                            disabled={disabled || item.progress >= maxProgressValue}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              {/* Advanced editing controls */}
              {isEditing && showAdvancedControls && (
                <div className="space-y-3 pt-2 border-t">
                  {/* Rating and Priority */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium w-16">Rating:</label>
                      <Input
                        type="number"
                        value={editValues.score}
                        onChange={(e) => setEditValues(prev => ({
                          ...prev,
                          score: parseFloat(e.target.value) || 0
                        }))}
                        className="w-20 h-8"
                        min={0}
                        max={10}
                        step={0.1}
                        disabled={disabled}
                      />
                      <span className="text-sm text-muted-foreground">/ 10</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Priority:</label>
                      <Input
                        type="number"
                        value={editValues.priority}
                        onChange={(e) => setEditValues(prev => ({
                          ...prev,
                          priority: parseInt(e.target.value) || 0
                        }))}
                        className="w-16 h-8"
                        min={0}
                        max={5}
                        disabled={disabled}
                      />
                    </div>
                  </div>
                  
                  {/* Dates */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Started:</label>
                      <Input
                        type="date"
                        value={editValues.start_date}
                        onChange={(e) => setEditValues(prev => ({
                          ...prev,
                          start_date: e.target.value
                        }))}
                        className="h-8"
                        disabled={disabled}
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Finished:</label>
                      <Input
                        type="date"
                        value={editValues.finish_date}
                        onChange={(e) => setEditValues(prev => ({
                          ...prev,
                          finish_date: e.target.value
                        }))}
                        className="h-8"
                        disabled={disabled}
                      />
                    </div>
                  </div>
                  
                  {/* Notes */}
                  <div>
                    <label className="text-sm font-medium">Notes:</label>
                    <Textarea
                      ref={noteInputRef}
                      value={editValues.notes}
                      onChange={(e) => setEditValues(prev => ({
                        ...prev,
                        notes: e.target.value
                      }))}
                      placeholder="Add your notes..."
                      className="mt-1 min-h-20"
                      disabled={disabled}
                    />
                  </div>
                  
                  {/* Tags */}
                  <div>
                    <label className="text-sm font-medium">Tags:</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add tag..."
                        className="flex-1 h-8"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                        disabled={disabled}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleAddTag}
                        disabled={disabled || !newTag.trim()}
                      >
                        Add
                      </Button>
                    </div>
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.tags.map((tag) => (
                          <Badge 
                            key={tag} 
                            variant="secondary" 
                            className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            {tag} ×
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Display mode - Tags and Notes */}
              {!isEditing && !compact && (
                <div className="space-y-2">
                  {/* Tags */}
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {/* Notes preview */}
                  {item.notes && (
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="w-3 h-3" />
                        <span className="font-medium">Notes:</span>
                      </div>
                      <div className={cn(
                        'whitespace-pre-wrap break-words',
                        !showFullNotes && 'line-clamp-2'
                      )}>
                        {item.notes}
                      </div>
                      {item.notes.length > 100 && (
                        <button
                          onClick={() => setShowFullNotes(!showFullNotes)}
                          className="text-xs text-primary hover:underline mt-1"
                        >
                          {showFullNotes ? 'Show less' : 'Show more'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

// Memoize component for performance optimization
export const ListItem = memo(ListItemComponent);