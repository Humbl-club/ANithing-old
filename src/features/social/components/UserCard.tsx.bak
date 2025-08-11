import { memo, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserPlus, UserMinus, Users } from "lucide-react";
import { UserProfile } from "../types";

interface UserCardProps {
  user: UserProfile;
  currentUserId?: string;
  onFollow: (userId: string) => Promise<void>;
  onUnfollow: (userId: string) => Promise<void>;
}

const UserCardComponent = ({ user, currentUserId, onFollow, onUnfollow }: UserCardProps) => {
  const isCurrentUser = useMemo(() => user.id === currentUserId, [user.id, currentUserId]);
  
  const handleFollow = useCallback(() => onFollow(user.id), [onFollow, user.id]);
  const handleUnfollow = useCallback(() => onUnfollow(user.id), [onUnfollow, user.id]);
  
  const displayName = useMemo(() => 
    user.username || `User ${user.id.slice(0, 8)}`,
    [user.username, user.id]
  );
  
  return (
    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/5 transition-colors">
      <Avatar className="h-12 w-12">
        <AvatarImage src={user.avatar_url} alt={displayName} />
        <AvatarFallback>
          <Users className="h-6 w-6" />
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">
          {displayName}
        </p>
        {user.bio && (
          <p className="text-sm text-muted-foreground truncate">{user.bio}</p>
        )}
        <div className="flex items-center space-x-4 mt-1">
          <Badge variant="secondary" className="text-xs">
            {user.followers_count} followers
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {user.lists_count} lists
          </Badge>
        </div>
      </div>
      
      {!isCurrentUser && (
        <Button
          size="sm"
          variant={user.is_following ? "outline" : "default"}
          onClick={user.is_following ? handleUnfollow : handleFollow}
          className="ml-2"
        >
          {user.is_following ? (
            <>
              <UserMinus className="h-4 w-4 mr-1" />
              Unfollow
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-1" />
              Follow
            </>
          )}
        </Button>
      )}
    </div>
  );
};

// Memoize component for performance optimization
export const UserCard = memo(UserCardComponent);