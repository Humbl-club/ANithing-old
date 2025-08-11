import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit2, CheckSquare, Square } from 'lucide-react';
import { type ListStatus } from '@/types/userLists';

interface BulkActionsProps {
  selectedCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkStatusChange: (statusId: string) => void;
  onBulkDelete: () => void;
  listStatuses: ListStatus[];
  contentType: 'anime' | 'manga' | 'both';
  isAllSelected: boolean;
}

export function BulkActions({
  selectedCount,
  onSelectAll,
  onDeselectAll,
  onBulkStatusChange,
  onBulkDelete,
  listStatuses,
  contentType,
  isAllSelected
}: BulkActionsProps) {
  const availableStatuses = listStatuses.filter(status => 
    status.media_type === contentType || status.media_type === 'both'
  );

  if (selectedCount === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg border">
      <div className="flex items-center gap-3">
        {/* Selection Info */}
        <div className="flex items-center gap-2">
          <Badge variant="default" className="font-medium">
            {selectedCount} selected
          </Badge>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={isAllSelected ? onDeselectAll : onSelectAll}
            className="h-8"
          >
            {isAllSelected ? (
              <>
                <Square className="w-4 h-4 mr-1" />
                Deselect All
              </>
            ) : (
              <>
                <CheckSquare className="w-4 h-4 mr-1" />
                Select All
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Bulk Actions */}
      <div className="flex items-center gap-2">
        {/* Bulk Status Change */}
        <Select onValueChange={onBulkStatusChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Change status..." />
          </SelectTrigger>
          <SelectContent>
            {availableStatuses.map(status => (
              <SelectItem key={status.id} value={status.id}>
                <div className="flex items-center gap-2">
                  <Edit2 className="w-3 h-3" />
                  {status.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Bulk Delete */}
        <Button
          variant="destructive"
          size="sm"
          onClick={onBulkDelete}
          className="gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete Selected
        </Button>
      </div>
    </div>
  );
}