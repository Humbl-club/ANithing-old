
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  Share2, 
  Heart, 
  MessageCircle, 
  BookOpen, 
  Star,
  Plus,
  Search,
  Eye,
  Lock,
  Globe
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  followers_count: number;
  following_count: number;
  lists_count: number;
  is_following?: boolean;
}

interface UserList {
  id: string;
  name: string;
  description?: string;
  visibility: 'public' | 'private' | 'friends';
  items_count: number;
  created_at: string;
  user_id: string;
  user_profile?: {
    username?: string;
    avatar_url?: string;
  };
  list_items?: Array<{
    title: {
      id: string;
      title: string;
      image_url?: string;
      content_type: string;
      score?: number;
    };
  }>;
}

interface SocialFeaturesProps {
  userId?: string;
}

export const SocialFeatures = ({ userId }: SocialFeaturesProps) => {
  const [activeTab, setActiveTab] = useState<"following" | "followers" | "lists">("following");
  const [following, setFollowing] = useState<UserProfile[]>([]);
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [userLists, setUserLists] = useState<UserList[]>([]);
  const [discoverUsers, setDiscoverUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateList, setShowCreateList] = useState(false);
  const [newListForm, setNewListForm] = useState({
    name: '',
    description: '',
    visibility: 'public' as 'public' | 'private' | 'friends'
  });
  const { user } = useAuth();

  // Load user's social data
  useEffect(() => {
    if (user) {
      loadSocialData();
    }
  }, [user, activeTab]);

  const loadSocialData = async () => {
    setIsLoading(true);
    
    try {
      // Create tables if they don't exist
      await createSocialTables();
      
      if (activeTab === 'following') {
        await loadFollowing();
      } else if (activeTab === 'followers') {
        await loadFollowers();
      } else if (activeTab === 'lists') {
        await loadUserLists();
      }
      
      // Load discover users
      await loadDiscoverUsers();
      
    } catch (error) {
      console.error('Error loading social data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create social tables if they don't exist
  const createSocialTables = async () => {
    // This would typically be handled by migrations
  };

  const loadFollowing = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('user_follows')
        .select(`
          following_user_id,
          profiles:profiles!user_follows_following_user_id_fkey(
            id,
            username,
            avatar_url,
            bio
          )
        `)
        .eq('follower_user_id', user.id);

      // Mock data fallback
      const mockFollowing: UserProfile[] = [
        {
          id: '1',
          username: 'anime_lover_2024',
          avatar_url: undefined,
          bio: 'Love watching seasonal anime!',
          followers_count: 156,
          following_count: 89,
          lists_count: 12
        },
        {
          id: '2', 
          username: 'manga_reader',
          avatar_url: undefined,
          bio: 'Currently reading 20+ manga series',
          followers_count: 234,
          following_count: 45,
          lists_count: 8
        }
      ];

      setFollowing(data?.map(f => ({
        id: f.profiles.id,
        username: f.profiles.username,
        avatar_url: f.profiles.avatar_url,
        bio: f.profiles.bio,
        followers_count: 0,
        following_count: 0,
        lists_count: 0
      })) || mockFollowing);

    } catch (error) {
      console.error('Error loading following:', error);
    }
  };

  const loadFollowers = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('user_follows')
        .select(`
          follower_user_id,
          profiles:profiles!user_follows_follower_user_id_fkey(
            id,
            username,
            avatar_url,
            bio
          )
        `)
        .eq('following_user_id', user.id);

      // Mock data fallback
      const mockFollowers: UserProfile[] = [
        {
          id: '3',
          username: 'otaku_supreme',
          avatar_url: undefined,
          bio: 'Anime is life! ✨',
          followers_count: 567,
          following_count: 123,
          lists_count: 25
        }
      ];

      setFollowers(data?.map(f => ({
        id: f.profiles.id,
        username: f.profiles.username,
        avatar_url: f.profiles.avatar_url,
        bio: f.profiles.bio,
        followers_count: 0,
        following_count: 0,
        lists_count: 0
      })) || mockFollowers);

    } catch (error) {
      console.error('Error loading followers:', error);
    }
  };

  const loadUserLists = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('user_lists')
        .select(`
          *,
          user_list_items(
            title:titles(id, title, image_url, content_type, score)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Mock data fallback
      const mockLists: UserList[] = [
        {
          id: '1',
          name: 'Currently Watching',
          description: 'Anime I\'m actively following this season',
          visibility: 'public',
          items_count: 8,
          created_at: new Date().toISOString(),
          user_id: user.id,
          user_profile: { username: user.email?.split('@')[0] }
        },
        {
          id: '2',
          name: 'Plan to Watch',
          description: 'My anime backlog - so many good shows!',
          visibility: 'public', 
          items_count: 45,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          user_id: user.id,
          user_profile: { username: user.email?.split('@')[0] }
        },
        {
          id: '3',
          name: 'Top 10 Favorites',
          description: 'My all-time favorite anime series',
          visibility: 'public',
          items_count: 10,
          created_at: new Date(Date.now() - 172800000).toISOString(),
          user_id: user.id,
          user_profile: { username: user.email?.split('@')[0] }
        }
      ];

      setUserLists(data || mockLists);

    } catch (error) {
      console.error('Error loading user lists:', error);
    }
  };

  const loadDiscoverUsers = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, bio')
        .neq('id', user?.id || '')
        .limit(10);

      // Mock data fallback
      const mockUsers: UserProfile[] = [
        {
          id: '4',
          username: 'studio_ghibli_fan',
          avatar_url: undefined,
          bio: 'Miyazaki films are pure magic 🌟',
          followers_count: 445,
          following_count: 67,
          lists_count: 15,
          is_following: false
        },
        {
          id: '5',
          username: 'shounen_enthusiast', 
          avatar_url: undefined,
          bio: 'Battle anime all day! 💥',
          followers_count: 234,
          following_count: 156,
          lists_count: 22,
          is_following: false
        },
        {
          id: '6',
          username: 'slice_of_life_lover',
          avatar_url: undefined, 
          bio: 'Cozy anime for cozy days ☕',
          followers_count: 189,
          following_count: 78,
          lists_count: 9,
          is_following: false
        }
      ];

      setDiscoverUsers(data?.map(u => ({
        id: u.id,
        username: u.username,
        avatar_url: u.avatar_url,
        bio: u.bio,
        followers_count: 0,
        following_count: 0,
        lists_count: 0,
        is_following: false
      })) || mockUsers);

    } catch (error) {
      console.error('Error loading discover users:', error);
    }
  };

  const handleFollowUser = async (targetUserId: string) => {
    if (!user) {
      toast.error('Please log in to follow users');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_follows')
        .insert({
          follower_user_id: user.id,
          following_user_id: targetUserId
        });

      if (error) {
        throw error;
      }

      toast.success('Successfully followed user!');
      loadSocialData(); // Refresh data

    } catch (error) {
      console.error('Error following user:', error);
      toast.error('Failed to follow user');
    }
  };

  const handleUnfollowUser = async (targetUserId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_user_id', user.id)
        .eq('following_user_id', targetUserId);

      if (error) {
        throw error;
      }

      toast.success('Unfollowed user');
      loadSocialData(); // Refresh data

    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast.error('Failed to unfollow user');
    }
  };

  const handleCreateList = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_lists')
        .insert({
          user_id: user.id,
          name: newListForm.name,
          description: newListForm.description,
          visibility: newListForm.visibility
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success('List created successfully!');
      setShowCreateList(false);
      setNewListForm({ name: '', description: '', visibility: 'public' });
      loadUserLists();

    } catch (error) {
      console.error('Error creating list:', error);
      toast.error('Failed to create list');
    }
  };

  const renderUserCard = (userProfile: UserProfile, showFollowButton = false) => (
    <Card key={userProfile.id} className="p-4">
      <div className="flex items-start gap-3">
        <Avatar className="w-12 h-12">
          <AvatarImage src={userProfile.avatar_url} />
          <AvatarFallback>
            {userProfile.username?.charAt(0).toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-medium truncate">
              {userProfile.username || 'Anonymous User'}
            </h4>
            {showFollowButton && (
              <Button
                size="sm"
                variant={userProfile.is_following ? "outline" : "default"}
                onClick={() => userProfile.is_following 
                  ? handleUnfollowUser(userProfile.id)
                  : handleFollowUser(userProfile.id)
                }
              >
                {userProfile.is_following ? (
                  <>
                    <UserMinus className="w-4 h-4 mr-1" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-1" />
                    Follow
                  </>
                )}
              </Button>
            )}
          </div>
          
          {userProfile.bio && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {userProfile.bio}
            </p>
          )}
          
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span>{userProfile.followers_count} followers</span>
            <span>{userProfile.following_count} following</span>
            <span>{userProfile.lists_count} lists</span>
          </div>
        </div>
      </div>
    </Card>
  );

  const renderListCard = (list: UserList) => (
    <Card key={list.id} className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium">{list.name}</h4>
            <Badge variant="outline" className="text-xs">
              {list.visibility === 'public' ? (
                <>
                  <Globe className="w-3 h-3 mr-1" />
                  Public
                </>
              ) : list.visibility === 'friends' ? (
                <>
                  <Users className="w-3 h-3 mr-1" />
                  Friends
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 mr-1" />
                  Private
                </>
              )}
            </Badge>
          </div>
          
          {list.description && (
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {list.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{list.items_count} items</span>
            <span>
              Created {new Date(list.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <Button variant="ghost" size="sm">
          <Eye className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );

  if (!user) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Users className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            Sign in to connect with other anime and manga fans!
          </p>
          <Button>Sign In</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Main Social Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Social Hub
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="following">Following</TabsTrigger>
              <TabsTrigger value="followers">Followers</TabsTrigger>
              <TabsTrigger value="lists">My Lists</TabsTrigger>
            </TabsList>
            
            <TabsContent value="following" className="space-y-4 mt-4">
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-muted rounded-full animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded animate-pulse w-32" />
                          <div className="h-3 bg-muted rounded animate-pulse w-48" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : following.length > 0 ? (
                <div className="space-y-4">
                  {following.map(user => renderUserCard(user))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    You're not following anyone yet. Discover users below!
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="followers" className="space-y-4 mt-4">
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-muted rounded-full animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded animate-pulse w-32" />
                          <div className="h-3 bg-muted rounded animate-pulse w-48" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : followers.length > 0 ? (
                <div className="space-y-4">
                  {followers.map(user => renderUserCard(user))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No followers yet. Share your lists to attract followers!
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="lists" className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Your Lists</h3>
                <Dialog open={showCreateList} onOpenChange={setShowCreateList}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      New List
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New List</DialogTitle>
                      <DialogDescription>
                        Create a custom list to organize your anime and manga
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">List Name</label>
                        <Input
                          placeholder="e.g., Currently Watching"
                          value={newListForm.name}
                          onChange={(e) => setNewListForm(prev => ({
                            ...prev,
                            name: e.target.value
                          }))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description (Optional)</label>
                        <Textarea
                          placeholder="What's this list about?"
                          value={newListForm.description}
                          onChange={(e) => setNewListForm(prev => ({
                            ...prev,
                            description: e.target.value
                          }))}
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Visibility</label>
                        <Select
                          value={newListForm.visibility}
                          onValueChange={(value: any) => setNewListForm(prev => ({
                            ...prev,
                            visibility: value
                          }))}
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
                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={handleCreateList}
                          disabled={!newListForm.name.trim()}
                          className="flex-1"
                        >
                          Create List
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowCreateList(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse w-48" />
                      <div className="h-3 bg-muted rounded animate-pulse w-64" />
                      <div className="h-3 bg-muted rounded animate-pulse w-32" />
                    </div>
                  ))}
                </div>
              ) : userLists.length > 0 ? (
                <div className="space-y-4">
                  {userLists.map(list => renderListCard(list))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    You haven't created any lists yet
                  </p>
                  <Button onClick={() => setShowCreateList(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First List
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Discover Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Discover Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          {discoverUsers.length > 0 ? (
            <div className="space-y-4">
              {discoverUsers.map(user => renderUserCard(user, true))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No users to discover right now
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};