import React, { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Star,
  Heart,
  Bookmark,
  Calendar,
  Target,
  Zap,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { useListManagement } from '../hooks/useListManagement';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { CustomList, CustomListType } from '@/types/userLists';

interface CustomListDialogProps {
  children: React.ReactNode;
  list?: CustomList;
  mode?: 'create' | 'edit';
  onSuccess?: (list: CustomList) => void;
}

interface ListForm {
  name: string;
  description: string;
  listTypeId: string;
  isPublic: boolean;
  isCollaborative: boolean;
  customIcon?: string;
  customColor?: string;
}

const defaultIcons = [
  { icon: 'heart', label: 'Heart', component: Heart },
  { icon: 'star', label: 'Star', component: Star },
  { icon: 'bookmark', label: 'Bookmark', component: Bookmark },
  { icon: 'calendar', label: 'Calendar', component: Calendar },
  { icon: 'target', label: 'Target', component: Target },
  { icon: 'zap', label: 'Zap', component: Zap }
];

const defaultColors = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // yellow
  '#10b981', // green
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#6b7280', // gray
];

export function CustomListDialog({ children, list, mode = 'create', onSuccess }: CustomListDialogProps) {
  const { user } = useAuth();
  const { createCustomList, customLists } = useListManagement();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [listTypes, setListTypes] = useState<CustomListType[]>([]);
  const [form, setForm] = useState<ListForm>({
    name: '',
    description: '',
    listTypeId: '',
    isPublic: false,
    isCollaborative: false
  });

  // Initialize form when dialog opens or list prop changes
  useEffect(() => {
    if (list && mode === 'edit') {
      setForm({
        name: list.name,
        description: list.description || '',
        listTypeId: list.list_type_id || '',
        isPublic: list.is_public,
        isCollaborative: list.is_collaborative,
        customIcon: list.list_type?.icon,
        customColor: list.list_type?.color
      });
    } else {
      setForm({
        name: '',
        description: '',
        listTypeId: '',
        isPublic: false,
        isCollaborative: false
      });
    }
  }, [list, mode]);

  // Load list types when dialog opens
  useEffect(() => {
    if (open) {
      loadListTypes();
    }
  }, [open]);

  const loadListTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_list_types')
        .select('*')
        .order('sort_order');

      if (error) throw error;
      setListTypes(data || []);
      
      // Set default list type if none selected
      if (!form.listTypeId && data && data.length > 0) {
        setForm(prev => ({ ...prev, listTypeId: data[0].id }));
      }
    } catch (error) {
      console.error('Error loading list types:', error);
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('Please enter a list name');
      return;
    }

    // Check for duplicate names
    const existingList = customLists.find(l => 
      l.name.toLowerCase() === form.name.trim().toLowerCase() && 
      l.id !== list?.id
    );
    
    if (existingList) {
      toast.error('A list with this name already exists');
      return;
    }

    try {
      setIsLoading(true);
      
      if (mode === 'create') {
        const newList = await createCustomList(
          form.name.trim(),
          form.description.trim() || undefined,
          form.isPublic
        );
        
        // Update additional properties
        if (form.listTypeId || form.isCollaborative) {
          await supabase
            .from('custom_lists')
            .update({
              list_type_id: form.listTypeId || null,
              is_collaborative: form.isCollaborative
            })
            .eq('id', newList.id);
        }
        
        toast.success('Custom list created successfully');
        onSuccess?.(newList);
      } else if (list) {
        // Update existing list
        const { error } = await supabase
          .from('custom_lists')
          .update({
            name: form.name.trim(),
            description: form.description.trim() || null,
            list_type_id: form.listTypeId || null,
            is_public: form.isPublic,
            is_collaborative: form.isCollaborative,
            updated_at: new Date().toISOString()
          })
          .eq('id', list.id);

        if (error) throw error;
        
        toast.success('List updated successfully');
        onSuccess?.({
          ...list,
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          list_type_id: form.listTypeId || undefined,
          is_public: form.isPublic,
          is_collaborative: form.isCollaborative
        });
      }
      
      setOpen(false);
    } catch (error) {
      console.error('Error saving list:', error);
      toast.error(mode === 'create' ? 'Failed to create list' : 'Failed to update list');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!list) return;
    
    if (!confirm('Are you sure you want to delete this list? This action cannot be undone.')) {
      return;
    }

    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('custom_lists')
        .delete()
        .eq('id', list.id);

      if (error) throw error;
      
      toast.success('List deleted successfully');
      setOpen(false);
    } catch (error) {
      console.error('Error deleting list:', error);
      toast.error('Failed to delete list');
    } finally {
      setIsLoading(false);
    }
  };

  const createCustomListType = async (name: string, icon: string, color: string) => {
    try {
      const { data, error } = await supabase
        .from('custom_list_types')
        .insert({
          name: name.toLowerCase().replace(/\s+/g, '_'),
          description: `Custom ${name} list`,
          icon,
          color,
          is_system: false,
          sort_order: listTypes.length
        })
        .select()
        .single();

      if (error) throw error;
      
      setListTypes(prev => [...prev, data]);
      setForm(prev => ({ ...prev, listTypeId: data.id }));
      toast.success('Custom list type created');
      
      return data;
    } catch (error) {
      console.error('Error creating custom list type:', error);
      toast.error('Failed to create custom list type');
      throw error;
    }
  };

  const selectedListType = listTypes.find(lt => lt.id === form.listTypeId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'create' ? (
              <><Plus className="w-5 h-5" /> Create Custom List</>
            ) : (
              <><Edit className="w-5 h-5" /> Edit List</>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="list-name">List Name *</Label>
              <Input
                id="list-name"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter list name..."
                maxLength={100}
              />
            </div>
            
            <div>
              <Label htmlFor="list-description">Description</Label>
              <Textarea
                id="list-description"
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your list..."
                rows={3}
                maxLength={500}
              />
            </div>
          </div>

          {/* List Type */}
          <Card>
            <CardHeader>
              <CardTitle>List Type</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="existing">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="existing">Choose Existing</TabsTrigger>
                  <TabsTrigger value="custom">Create Custom</TabsTrigger>
                </TabsList>
                
                <TabsContent value="existing" className="space-y-4">
                  <div className="grid gap-3">
                    {listTypes.map((listType) => {
                      const IconComponent = defaultIcons.find(i => i.icon === listType.icon)?.component || Star;
                      return (
                        <div
                          key={listType.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            form.listTypeId === listType.id 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => setForm(prev => ({ ...prev, listTypeId: listType.id }))}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="p-2 rounded-full"
                              style={{ backgroundColor: `${listType.color}20`, color: listType.color }}
                            >
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-medium capitalize">
                                {listType.name.replace(/_/g, ' ')}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {listType.description}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>
                
                <TabsContent value="custom" className="space-y-4">
                  <div>
                    <Label>Icon</Label>
                    <div className="grid grid-cols-6 gap-2 mt-2">
                      {defaultIcons.map((iconItem) => {
                        const IconComponent = iconItem.component;
                        return (
                          <Button
                            key={iconItem.icon}
                            variant={form.customIcon === iconItem.icon ? 'default' : 'outline'}
                            size="sm"
                            className="aspect-square"
                            onClick={() => setForm(prev => ({ ...prev, customIcon: iconItem.icon }))}
                          >
                            <IconComponent className="w-4 h-4" />
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Color</Label>
                    <div className="grid grid-cols-9 gap-2 mt-2">
                      {defaultColors.map((color) => (
                        <Button
                          key={color}
                          variant={form.customColor === color ? 'default' : 'outline'}
                          size="sm"
                          className="aspect-square p-0"
                          style={{ backgroundColor: color }}
                          onClick={() => setForm(prev => ({ ...prev, customColor: color }))}
                        >
                          {form.customColor === color && (
                            <div className="w-4 h-4 rounded-full bg-white/90 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-current" />
                            </div>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {form.customIcon && form.customColor && (
                    <div className="p-3 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-2">Preview:</div>
                      <div className="flex items-center gap-3">
                        <div 
                          className="p-2 rounded-full"
                          style={{ backgroundColor: `${form.customColor}20`, color: form.customColor }}
                        >
                          {(() => {
                            const IconComponent = defaultIcons.find(i => i.icon === form.customIcon)?.component || Star;
                            return <IconComponent className="w-4 h-4" />;
                          })()}
                        </div>
                        <div className="font-medium">{form.name || 'Custom List'}</div>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                List Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Public List</Label>
                  <p className="text-sm text-muted-foreground">
                    Anyone can view this list
                  </p>
                </div>
                <Switch
                  checked={form.isPublic}
                  onCheckedChange={(checked) => setForm(prev => ({ ...prev, isPublic: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Collaborative</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow others to contribute to this list
                  </p>
                </div>
                <Switch
                  checked={form.isCollaborative}
                  onCheckedChange={(checked) => setForm(prev => ({ ...prev, isCollaborative: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <DialogFooter className="flex justify-between">
          <div>
            {mode === 'edit' && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete List
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading || !form.name.trim()}>
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : mode === 'create' ? (
                <Plus className="w-4 h-4 mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {mode === 'create' ? 'Create List' : 'Save Changes'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}