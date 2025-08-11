import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { UserProfile } from "../types";
import { UserCard } from "./UserCard";

export function FollowingTab() {
  const [following, setFollowing] = useState<UserProfile[]>([]);
  const [discoverUsers, setDiscoverUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadFollowing();
      loadDiscoverUsers();
    }
  }, [user]);

  const loadFollowing = async () => {
    // Mock data for now - replace with actual API call
    const mockFollowing: UserProfile[] = [
      {
        id: "1",
        username: "anime_lover_01",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=anime_lover_01",
        bio: "Watching anime since 2010 🍿",
        followers_count: 156,
        following_count: 89,
        lists_count: 12,
        is_following: true
      },
      {
        id: "2",
        username: "manga_reader_pro",
        bio: "Manga collector and reviewer",
        followers_count: 234,
        following_count: 145,
        lists_count: 8,
        is_following: true
      }
    ];
    
    setFollowing(mockFollowing);
  };

  const loadDiscoverUsers = async () => {
    // Mock data for discovery
    const mockDiscover: UserProfile[] = [
      {
        id: "3",
        username: "otaku_sensei",
        bio: "Anime expert since 1995",
        followers_count: 1203,
        following_count: 567,
        lists_count: 45,
        is_following: false
      }
    ];
    
    setDiscoverUsers(mockDiscover);
    setIsLoading(false);
  };

  const handleFollow = async (userId: string) => {
    try {
      // Mock follow action
      setDiscoverUsers(prev => 
        prev.map(u => u.id === userId ? { ...u, is_following: true, followers_count: u.followers_count + 1 } : u)
      );
      toast.success("User followed successfully!");
    } catch (error) {
      toast.error("Failed to follow user");
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
      // Mock unfollow action
      setFollowing(prev => prev.filter(u => u.id !== userId));
      toast.success("User unfollowed");
    } catch (error) {
      toast.error("Failed to unfollow user");
    }
  };

  const filteredFollowing = following.filter(u =>
    u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="space-y-2">
                <div className="w-32 h-4 bg-gray-200 rounded" />
                <div className="w-24 h-3 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search following..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Following List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Following ({filteredFollowing.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredFollowing.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {searchQuery ? "No users found matching your search" : "You're not following anyone yet"}
            </p>
          ) : (
            filteredFollowing.map(user => (
              <UserCard
                key={user.id}
                user={user}
                currentUserId={user?.id}
                onFollow={handleFollow}
                onUnfollow={handleUnfollow}
              />
            ))
          )}
        </CardContent>
      </Card>

      {/* Discover Users */}
      {discoverUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Discover Users
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {discoverUsers.map(user => (
              <UserCard
                key={user.id}
                user={user}
                currentUserId={user?.id}
                onFollow={handleFollow}
                onUnfollow={handleUnfollow}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}