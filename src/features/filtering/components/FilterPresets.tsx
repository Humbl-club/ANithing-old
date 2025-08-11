import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Save, Upload, Trash2, MoreVertical } from 'lucide-react';
import { useFilterPresets } from '@/hooks/useFilterPresets';
import { toast } from 'sonner';

interface FilterPresetsProps {
  contentType: 'anime' | 'manga';
  currentFilters: Record<string, any>;
  onLoadPreset: (filters: Record<string, any>) => void;
}

export function FilterPresets({ contentType, currentFilters, onLoadPreset }: FilterPresetsProps) {
  const { presets, savePreset, loadPreset, deletePreset, isLoading } = useFilterPresets(contentType);
  const [showPresetDialog, setShowPresetDialog] = useState(false);
  const [presetName, setPresetName] = useState('');

  const handleSavePreset = async () => {
    if (!presetName.trim()) {
      toast.error('Please enter a preset name');
      return;
    }

    try {
      await savePreset(presetName.trim(), currentFilters);
      toast.success(`Preset "${presetName}" saved!`);
      setPresetName('');
      setShowPresetDialog(false);
    } catch (error) {
      toast.error('Failed to save preset');
    }
  };

  const handleLoadPreset = async (presetId: string) => {
    try {
      const filters = await loadPreset(presetId);
      onLoadPreset(filters);
      toast.success('Preset loaded!');
    } catch (error) {
      toast.error('Failed to load preset');
    }
  };

  const handleDeletePreset = async (presetId: string, presetName: string) => {
    try {
      await deletePreset(presetId);
      toast.success(`Preset "${presetName}" deleted`);
    } catch (error) {
      toast.error('Failed to delete preset');
    }
  };

  return (
    <div className="flex gap-2 pt-4">
      {/* Save Preset Dialog */}
      <Dialog open={showPresetDialog} onOpenChange={setShowPresetDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save Preset
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Filter Preset</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="preset-name">Preset Name</Label>
              <Input
                id="preset-name"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Enter preset name..."
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSavePreset}>Save</Button>
              <Button variant="outline" onClick={() => setShowPresetDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Load Preset Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isLoading || presets.length === 0}>
            <Upload className="w-4 h-4 mr-2" />
            Load Preset ({presets.length})
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {presets.map((preset) => (
            <DropdownMenuItem key={preset.id} className="flex items-center justify-between">
              <span 
                onClick={() => handleLoadPreset(preset.id)} 
                className="flex-1 cursor-pointer"
              >
                {preset.name}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 ml-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePreset(preset.id, preset.name);
                    }}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}