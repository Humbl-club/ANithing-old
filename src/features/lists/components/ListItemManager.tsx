import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Search, 
  Check, 
  X,
  Star,
  Heart,
  BookOpen,
  Play,
  Clock,
  Calendar,
  Tag,
  Settings,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useListManagement } from '../hooks/useListManagement';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { 
  CustomList, 
  CustomListItem, 
  UserTitleListEntry,
  ListStatus 
} from '@/types/userLists';
import { cn } from '@/lib/utils';

interface ListItemManagerProps {
  children: React.ReactNode;
  titleId?: string;
  initialList?: CustomList;
  mode?: 'add' | 'manage';
  onSuccess?: () => void;
}

interface AddItemForm {
  listIds: string[];
  statusId: string;
  rating: number;
  progress: number;
  notes: string;
  tags: string[];
  startDate: string;
  isPrivate: boolean;
  priority: number;
}

interface SearchResult {
  id: string;
  title: string;
  media_type: 'anime' | 'manga';
  cover_image?: string;
  year?: number;
  status?: string;
  episodes?: number;
  chapters?: number;
  genres?: string[];
  already_in_lists?: string[];
}

export function ListItemManager({ 
  children, 
  titleId, 
  initialList, 
  mode = 'add',
  onSuccess 
}: ListItemManagerProps) {
  const { user } = useAuth();
  const { 
    customLists, 
    listStatuses, 
    addToList, 
    updateListEntry, 
    deleteListEntry,
    createCustomList 
  } = useListManagement();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedTitle, setSelectedTitle] = useState<SearchResult | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'add' | 'manage'>(
    titleId ? 'add' : 'search'
  );
  const [form, setForm] = useState<AddItemForm>({
    listIds: initialList ? [initialList.id] : [],
    statusId: '',
    rating: 0,
    progress: 0,
    notes: '',
    tags: [],
    startDate: '',
    isPrivate: false,
    priority: 0
  });
  const [newTag, setNewTag] = useState('');
  const [newListName, setNewListName] = useState('');
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [existingListItems, setExistingListItems] = useState<CustomListItem[]>([]);

  // Load title data if titleId is provided
  useEffect(() => {
    if (titleId && open) {
      loadTitleData();
    }
  }, [titleId, open]);

  // Set default status when statuses are loaded
  useEffect(() => {
    if (listStatuses.length > 0 && !form.statusId) {
      const defaultStatus = selectedTitle?.media_type === 'anime' 
        ? listStatuses.find(s => s.name === 'plan_to_watch')
        : listStatuses.find(s => s.name === 'plan_to_read');
      
      if (defaultStatus) {
        setForm(prev => ({ ...prev, statusId: defaultStatus.id }));
      }
    }
  }, [listStatuses, selectedTitle, form.statusId]);

  const loadTitleData = async () => {
    if (!titleId) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('titles')
        .select(`
          id,
          title,
          media_type,
          cover_image,
          anime_details(*),
          manga_details(*)
        `)
        .eq('id', titleId)
        .single();

      if (error) throw error;
      
      const titleData: SearchResult = {
        id: data.id,
        title: data.title,
        media_type: data.media_type,
        cover_image: data.cover_image,
        episodes: data.anime_details?.episodes,
        chapters: data.manga_details?.chapters,
        year: data.anime_details?.start_year || data.manga_details?.start_year
      };
      
      setSelectedTitle(titleData);
      
      // Check if title is already in user's lists
      if (user) {
        const { data: existingItems } = await supabase
          .from('user_lists')
          .select('*, status:list_statuses(*)')
          .eq('user_id', user.id)
          .eq('title_id', titleId);
        
        if (existingItems && existingItems.length > 0) {
          setActiveTab('manage');
        }
      }
      
    } catch (error) {
      console.error('Error loading title data:', error);
      toast.error('Failed to load title data');
    } finally {
      setLoading(false);
    }
  };

  const searchTitles = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('titles')
        .select(`
          id,
          title,
          media_type,
          cover_image,
          anime_details(episodes, start_year),
          manga_details(chapters, start_year)
        `)
        .ilike('title', `%${query}%`)
        .limit(20);

      if (error) throw error;

      const results: SearchResult[] = data.map(item => ({
        id: item.id,
        title: item.title,
        media_type: item.media_type,
        cover_image: item.cover_image,
        episodes: item.anime_details?.episodes,
        chapters: item.manga_details?.chapters,
        year: item.anime_details?.start_year || item.manga_details?.start_year
      }));
      
      setSearchResults(results);
      
    } catch (error) {
      console.error('Error searching titles:', error);
      toast.error('Failed to search titles');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(
    debounce((query: string) => searchTitles(query), 300),
    []
  );

  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery, handleSearch]);

  const handleSelectTitle = (title: SearchResult) => {
    setSelectedTitle(title);
    setActiveTab('add');
    
    // Set appropriate default status based on media type
    const defaultStatus = title.media_type === 'anime' 
      ? listStatuses.find(s => s.name === 'plan_to_watch')
      : listStatuses.find(s => s.name === 'plan_to_read');
    
    if (defaultStatus) {
      setForm(prev => ({ ...prev, statusId: defaultStatus.id }));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !form.tags.includes(newTag.trim())) {
      setForm(prev => ({ 
        ...prev, 
        tags: [...prev.tags, newTag.trim()] 
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setForm(prev => ({ 
      ...prev, 
      tags: prev.tags.filter(tag => tag !== tagToRemove) 
    }));
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      toast.error('Please enter a list name');
      return;
    }

    try {
      setIsCreatingList(true);
      
      const newList = await createCustomList(newListName.trim());
      setForm(prev => ({ 
        ...prev, 
        listIds: [...prev.listIds, newList.id] 
      }));
      setNewListName('');
      toast.success('List created successfully');
      
    } catch (error) {
      console.error('Error creating list:', error);
      toast.error('Failed to create list');
    } finally {
      setIsCreatingList(false);
    }
  };

  const handleAddToLists = async () => {
    if (!selectedTitle || form.listIds.length === 0 || !form.statusId) {
      toast.error('Please select at least one list and a status');
      return;
    }

    try {
      setLoading(true);
      
      // Add to main user list first
      const mainListEntry = await addToList(
        selectedTitle.id,
        form.statusId,
        selectedTitle.media_type,
        {
          progress: form.progress,
          score: form.rating || undefined,
          notes: form.notes || undefined,
          tags: form.tags.length > 0 ? form.tags : undefined,
          start_date: form.startDate || undefined,
          priority: form.priority,
          visibility: form.isPrivate ? 'private' : 'public'
        }
      );
      
      // Add to custom lists
      for (const listId of form.listIds) {
        await supabase
          .from('custom_list_items')
          .insert({
            list_id: listId,
            title_id: selectedTitle.id,
            notes: form.notes || null,
            personal_rating: form.rating || null,
            tags: form.tags,
            sort_order: 0
          });
      }
      
      toast.success(`Added "${selectedTitle.title}" to ${form.listIds.length} list(s)`);
      onSuccess?.();
      setOpen(false);
      
      // Reset form
      setForm({
        listIds: [],
        statusId: '',
        rating: 0,
        progress: 0,
        notes: '',
        tags: [],
        startDate: '',
        isPrivate: false,
        priority: 0
      });
      setSelectedTitle(null);
      setActiveTab('search');
      
    } catch (error) {
      console.error('Error adding to lists:', error);
      toast.error('Failed to add to lists');
    } finally {
      setLoading(false);
    }
  };

  const availableStatuses = useMemo(() => {
    if (!selectedTitle) return [];
    return listStatuses.filter(status => 
      status.media_type === selectedTitle.media_type || status.media_type === 'both'
    );
  }, [listStatuses, selectedTitle]);

  const maxProgress = selectedTitle?.media_type === 'anime' 
    ? selectedTitle.episodes || 24
    : selectedTitle?.chapters || 50;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {mode === 'add' ? 'Add to Lists' : 'Manage List Items'}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search" disabled={!!titleId}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </TabsTrigger>
            <TabsTrigger value="add" disabled={!selectedTitle}>
              <Plus className="w-4 h-4 mr-2" />
              Add to Lists
            </TabsTrigger>
            <TabsTrigger value="manage">
              <Settings className="w-4 h-4 mr-2" />
              Manage
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="search" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Search for Anime/Manga</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for anime or manga..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {loading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                )}
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {searchResults.map((result) => (
                    <Card 
                      key={result.id} 
                      className="cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => handleSelectTitle(result)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          {result.cover_image && (
                            <img
                              src={result.cover_image}
                              alt={result.title}
                              className="w-12 h-16 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="font-medium">{result.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">
                                {result.media_type}
                              </Badge>
                              {result.year && (
                                <Badge variant="outline">
                                  {result.year}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="add" className="space-y-4">
            {selectedTitle && (
              <>
                {/* Selected Title Preview */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {selectedTitle.cover_image && (
                        <img
                          src={selectedTitle.cover_image}
                          alt={selectedTitle.title}
                          className="w-16 h-20 object-cover rounded"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold">{selectedTitle.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge>{selectedTitle.media_type}</Badge>
                          {selectedTitle.year && <Badge variant="outline">{selectedTitle.year}</Badge>}
                          {selectedTitle.media_type === 'anime' && selectedTitle.episodes && (
                            <Badge variant="outline">{selectedTitle.episodes} episodes</Badge>
                          )}
                          {selectedTitle.media_type === 'manga' && selectedTitle.chapters && (
                            <Badge variant="outline">{selectedTitle.chapters} chapters</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Add to Lists Form */}
                <Card>
                  <CardHeader>
                    <CardTitle>Add to Lists</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* List Selection */}
                    <div className="space-y-3">
                      <Label>Select Lists</Label>
                      <div className="grid gap-2 max-h-40 overflow-y-auto">
                        {customLists.map((list) => (
                          <div key={list.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`list-${list.id}`}
                              checked={form.listIds.includes(list.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setForm(prev => ({ 
                                    ...prev, 
                                    listIds: [...prev.listIds, list.id] 
                                  }));
                                } else {
                                  setForm(prev => ({ 
                                    ...prev, 
                                    listIds: prev.listIds.filter(id => id !== list.id) 
                                  }));
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                            <label htmlFor={`list-${list.id}`} className="flex-1 cursor-pointer">
                              {list.name}
                              {list.description && (
                                <span className="text-sm text-muted-foreground ml-2">
                                  - {list.description}
                                </span>
                              )}
                            </label>
                          </div>
                        ))}
                      </div>
                      
                      {/* Create New List */}
                      <div className="border-t pt-3">
                        <div className="flex gap-2">
                          <Input
                            placeholder="New list name..."
                            value={newListName}
                            onChange={(e) => setNewListName(e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            onClick={handleCreateList}
                            disabled={isCreatingList || !newListName.trim()}
                            size="sm"
                          >
                            {isCreatingList ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                            Create
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Status and Progress */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select value={form.statusId} onValueChange={(value) => setForm(prev => ({ ...prev, statusId: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableStatuses.map(status => (
                              <SelectItem key={status.id} value={status.id}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="progress">Progress</Label>
                        <Input
                          id="progress"
                          type="number"
                          value={form.progress}
                          onChange={(e) => setForm(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
                          min={0}
                          max={maxProgress}
                          placeholder={`0 - ${maxProgress}`}
                        />
                      </div>
                    </div>
                    
                    {/* Rating and Priority */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="rating">Rating (0-10)</Label>
                        <Input
                          id="rating"
                          type="number"
                          value={form.rating}
                          onChange={(e) => setForm(prev => ({ ...prev, rating: parseFloat(e.target.value) || 0 }))}
                          min={0}
                          max={10}
                          step={0.1}
                          placeholder="0.0"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="priority">Priority (0-5)</Label>
                        <Input
                          id="priority"
                          type="number"
                          value={form.priority}
                          onChange={(e) => setForm(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                          min={0}
                          max={5}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    
                    {/* Start Date */}
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={form.startDate}
                        onChange={(e) => setForm(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    
                    {/* Notes */}
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={form.notes}
                        onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Add your thoughts, review, or notes..."
                        rows={3}
                      />
                    </div>
                    
                    {/* Tags */}
                    <div>
                      <Label>Tags</Label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="Add a tag..."
                            className="flex-1"
                            onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                          />
                          <Button onClick={handleAddTag} size="sm" disabled={!newTag.trim()}>
                            Add
                          </Button>
                        </div>
                        {form.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {form.tags.map((tag) => (
                              <Badge 
                                key={tag} 
                                variant="secondary" 
                                className="cursor-pointer"
                                onClick={() => handleRemoveTag(tag)}
                              >
                                {tag} <X className="w-3 h-3 ml-1" />
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Privacy */}
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="private">Private Entry</Label>
                        <p className="text-sm text-muted-foreground">
                          Only you can see this entry
                        </p>
                      </div>
                      <Switch
                        id="private"
                        checked={form.isPrivate}
                        onCheckedChange={(checked) => setForm(prev => ({ ...prev, isPrivate: checked }))}
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <CardTitle>Manage List Items</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">This feature will show your existing list items for management.</p>
                {/* TODO: Implement list item management */}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          {activeTab === 'add' && (
            <Button 
              onClick={handleAddToLists} 
              disabled={loading || !selectedTitle || form.listIds.length === 0 || !form.statusId}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Add to {form.listIds.length} List(s)
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Simple debounce utility
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}