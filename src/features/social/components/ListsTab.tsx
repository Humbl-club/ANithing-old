import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Plus, Eye, Lock, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { UserList } from "../types";

export function ListsTab() {
  const [userLists, setUserLists] = useState<UserList[]>([]);
  const [showCreateList, setShowCreateList] = useState(false);
  const [newListForm, setNewListForm] = useState({
    name: '',
    description: '',
    visibility: 'public' as 'public' | 'private' | 'friends'
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadUserLists();
    }
  }, [user, loadUserLists]);

  const loadUserLists = useCallback(async () => {
    // Mock data for now - replace with actual API call
    const mockLists: UserList[] = [
      {
        id: "1",
        name: "Favorite Anime 2024",
        description: "My top anime picks for this year",
        visibility: 'public',
        items_count: 15,
        created_at: "2024-01-15T10:00:00Z",
        user_id: user?.id || "",
        list_items: [
          {
            title: {
              id: "1",
              title: "Attack on Titan",
              image_url: "https://via.placeholder.com/100x140",
              content_type: "anime",
              score: 9.5
            }
          }
        ]
      },
      {
        id: "2", 
        name: "Must Read Manga",
        description: "Essential manga everyone should read",
        visibility: 'friends',
        items_count: 8,
        created_at: "2024-02-01T15:30:00Z",
        user_id: user?.id || ""
      }
    ];
    
    setUserLists(mockLists);
    setIsLoading(false);
  }, [user?.id]);

  const handleCreateList = async () => {
    if (!newListForm.name.trim()) {
      toast.error("List name is required");
      return;
    }

    try {
      const newList: UserList = {
        id: Date.now().toString(),
        name: newListForm.name,
        description: newListForm.description,
        visibility: newListForm.visibility,
        items_count: 0,
        created_at: new Date().toISOString(),
        user_id: user?.id || ""
      };

      setUserLists(prev => [newList, ...prev]);
      setNewListForm({ name: '', description: '', visibility: 'public' });
      setShowCreateList(false);
      toast.success("List created successfully!");
    } catch (error) {
      toast.error("Failed to create list");
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Globe className="h-4 w-4" />;
      case 'friends': return <Eye className="h-4 w-4" />;
      case 'private': return <Lock className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="animate-pulse border rounded-lg p-6">
            <div className="w-32 h-4 bg-gray-200 rounded mb-2" />
            <div className="w-48 h-3 bg-gray-200 rounded mb-4" />
            <div className="w-20 h-6 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create List Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Your Lists ({userLists.length})</h3>
        <Dialog open={showCreateList} onOpenChange={setShowCreateList}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create List
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New List</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name*</label>
                <Input
                  value={newListForm.name}
                  onChange={(e) => setNewListForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter list name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newListForm.description}
                  onChange={(e) => setNewListForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Visibility</label>
                <Select 
                  value={newListForm.visibility} 
                  onValueChange={(value) => setNewListForm(prev => ({ ...prev, visibility: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public - Anyone can see</SelectItem>
                    <SelectItem value="friends">Friends Only</SelectItem>
                    <SelectItem value="private">Private - Only you</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateList(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateList}>Create List</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lists Grid */}
      {userLists.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No lists yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first list to organize your favorite anime and manga
            </p>
            <Button onClick={() => setShowCreateList(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First List
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userLists.map(list => (
            <Card key={list.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base line-clamp-2">{list.name}</CardTitle>
                  <div className="flex items-center gap-1 ml-2">
                    {getVisibilityIcon(list.visibility)}
                    <span className="text-xs text-muted-foreground capitalize">
                      {list.visibility}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {list.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {list.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">
                    {list.items_count} items
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(list.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}