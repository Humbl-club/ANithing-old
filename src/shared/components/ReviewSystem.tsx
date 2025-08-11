import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, Heart, ThumbsUp, ThumbsDown, MessageCircle, Send, User, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Review {
  id: string;
  user_id: string;
  title_id: string;
  rating: number;
  review_text?: string;
  is_spoiler: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  user_profiles?: {
    username?: string;
    avatar_url?: string;
  };
}

interface ReviewSystemProps {
  titleId: string;
  titleName: string;
  contentType: 'anime' | 'manga';
}

export const ReviewSystem = ({ titleId, titleName, contentType }: ReviewSystemProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    text: '',
    isSpoiler: false
  });
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'>('helpful');
  const [filterRating, setFilterRating] = useState<string>('all');
  const { user } = useAuth();

  // Load reviews
  useEffect(() => {
    loadReviews();
    if (user) {
      loadUserReview();
    }
  }, [titleId, user, sortBy, filterRating]);

  const loadReviews = async () => {
    setIsLoading(true);
    
    try {
      let query = supabase
        .from('reviews')
        .select(`
          *,
          user_profiles:profiles(username, avatar_url)
        `)
        .eq('title_id', titleId);

      // Apply rating filter
      if (filterRating !== 'all') {
        query = query.eq('rating', parseInt(filterRating));
      }

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'highest':
          query = query.order('rating', { ascending: false });
          break;
        case 'lowest':
          query = query.order('rating', { ascending: true });
          break;
        case 'helpful':
          query = query.order('helpful_count', { ascending: false });
          break;
      }

      const { data, error } = await query.limit(50);
      
      if (error) {
        console.error('Error loading reviews:', error);
        // Create table if it doesn't exist
        await createReviewsTable();
      } else {
        setReviews(data || []);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserReview = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('title_id', titleId)
        .eq('user_id', user.id)
        .single();

      setUserReview(data);
    } catch (error) {
      // User hasn't reviewed yet
    }
  };

  // Create reviews table if it doesn't exist
  const createReviewsTable = async () => {
    // This would typically be handled by migrations
  };

  const submitReview = async () => {
    if (!user || !newReview.rating) return;

    try {
      const reviewData = {
        user_id: user.id,
        title_id: titleId,
        rating: newReview.rating,
        review_text: newReview.text || null,
        is_spoiler: newReview.isSpoiler,
        helpful_count: 0
      };

      if (userReview) {
        // Update existing review
        const { error } = await supabase
          .from('reviews')
          .update(reviewData)
          .eq('id', userReview.id);

        if (error) throw error;
      } else {
        // Create new review
        const { error } = await supabase
          .from('reviews')
          .insert(reviewData);

        if (error) throw error;
      }

      setShowReviewForm(false);
      setNewReview({ rating: 0, text: '', isSpoiler: false });
      loadReviews();
      loadUserReview();
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const markHelpful = async (reviewId: string) => {
    if (!user) return;

    try {
      // This would typically track which users found reviews helpful
      // For now, just increment the count
      const review = reviews.find(r => r.id === reviewId);
      if (review) {
        const { error } = await supabase
          .from('reviews')
          .update({ helpful_count: review.helpful_count + 1 })
          .eq('id', reviewId);

        if (!error) {
          setReviews(prev => prev.map(r => 
            r.id === reviewId 
              ? { ...r, helpful_count: r.helpful_count + 1 }
              : r
          ));
        }
      }
    } catch (error) {
      console.error('Error marking helpful:', error);
    }
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onRatingChange?.(star)}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Reviews & Ratings
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                {renderStars(Math.round(averageRating))}
                <span className="font-medium">{averageRating.toFixed(1)}</span>
                <span className="text-muted-foreground">({reviews.length})</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* User Review Section */}
        {user && (
          <Card className="bg-accent/50">
            <CardContent className="p-4">
              {userReview ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Your Review</h4>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setNewReview({
                          rating: userReview.rating,
                          text: userReview.review_text || '',
                          isSpoiler: userReview.is_spoiler
                        });
                        setShowReviewForm(true);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {renderStars(userReview.rating)}
                    <span className="text-sm text-muted-foreground">
                      {formatDate(userReview.created_at)}
                    </span>
                  </div>
                  
                  {userReview.review_text && (
                    <p className="text-sm">{userReview.review_text}</p>
                  )}
                </div>
              ) : !showReviewForm ? (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    Share your thoughts about {titleName}
                  </p>
                  <Button onClick={() => setShowReviewForm(true)}>
                    <Star className="w-4 h-4 mr-2" />
                    Write a Review
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="font-medium">Write Your Review</h4>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rating</label>
                    {renderStars(newReview.rating, true, (rating) =>
                      setNewReview(prev => ({ ...prev, rating }))
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Review (Optional)</label>
                    <Textarea
                      placeholder={`What did you think about ${titleName}?`}
                      value={newReview.text}
                      onChange={(e) => setNewReview(prev => ({ ...prev, text: e.target.value }))}
                      rows={4}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="spoiler"
                      checked={newReview.isSpoiler}
                      onChange={(e) => setNewReview(prev => ({ ...prev, isSpoiler: e.target.checked }))}
                    />
                    <label htmlFor="spoiler" className="text-sm">
                      Contains spoilers
                    </label>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={submitReview}
                      disabled={!newReview.rating}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Submit Review
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setShowReviewForm(false);
                        setNewReview({ rating: 0, text: '', isSpoiler: false });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Filters and Sorting */}
        {reviews.length > 0 && (
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Sort by:</span>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="helpful">Most Helpful</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="highest">Highest Rating</SelectItem>
                  <SelectItem value="lowest">Lowest Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Filter:</span>
              <Select value={filterRating} onValueChange={setFilterRating}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
                    <div className="space-y-1 flex-1">
                      <div className="h-4 bg-muted rounded animate-pulse w-32" />
                      <div className="h-3 bg-muted rounded animate-pulse w-24" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded animate-pulse" />
                    <div className="h-3 bg-muted rounded animate-pulse w-4/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : reviews.length > 0 ? (
            reviews.map((review, index) => (
              <div key={review.id}>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={review.user_profiles?.avatar_url} />
                      <AvatarFallback>
                        <User className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {review.user_profiles?.username || 'Anonymous'}
                          </span>
                          {review.is_spoiler && (
                            <Badge variant="destructive" className="text-xs">
                              Spoiler
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                      </div>
                      
                      {review.review_text && (
                        <p className="text-sm leading-relaxed">
                          {review.review_text}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markHelpful(review.id)}
                          className="text-xs"
                        >
                          <ThumbsUp className="w-3 h-3 mr-1" />
                          Helpful ({review.helpful_count})
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {index < reviews.length - 1 && <Separator className="my-4" />}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No reviews yet. Be the first to share your thoughts!
              </p>
              {user && !userReview && (
                <Button 
                  className="mt-4"
                  onClick={() => setShowReviewForm(true)}
                >
                  <Star className="w-4 h-4 mr-2" />
                  Write First Review
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};