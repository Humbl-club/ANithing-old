import { useState, useEffect } from 'react';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useSettingsStore } from "@/store/settingsStore";
import { supabase } from "@/lib/supabaseClient";
import { User, Camera, Globe, Twitter, MapPin, Upload, X } from "lucide-react";

const GENRE_OPTIONS = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 
  'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller'
];

export const ProfileSettings = () => {
  const { toast } = useToast();
  const { settings, updateProfile, loading } = useSettingsStore();
  const { profile } = settings;
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(profile.avatar_url);

  useEffect(() => {
    setPreviewUrl(profile.avatar_url);
  }, [profile.avatar_url]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('user-content')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('user-content')
        .getPublicUrl(filePath);

      const avatarUrl = data.publicUrl;
      setPreviewUrl(avatarUrl);
      await updateProfile({ avatar_url: avatarUrl });
      
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = async () => {
    setPreviewUrl('');
    await updateProfile({ avatar_url: '' });
    toast({
      title: "Avatar removed",
      description: "Your profile picture has been removed.",
    });
  };

  const handleGenreToggle = async (genre: string) => {
    const currentGenres = profile.favorite_genres || [];
    const newGenres = currentGenres.includes(genre)
      ? currentGenres.filter(g => g !== genre)
      : [...currentGenres, genre];
    
    await updateProfile({ favorite_genres: newGenres });
  };

  const validateField = (field: string, value: string): string | null => {
    switch (field) {
      case 'display_name':
        if (value.length > 50) return 'Display name must be 50 characters or less';
        if (value.length > 0 && value.length < 2) return 'Display name must be at least 2 characters';
        break;
      case 'bio':
        if (value.length > 500) return 'Bio must be 500 characters or less';
        break;
      case 'website':
        if (value && !z.string().url().safeParse(value).success) {
          return 'Please enter a valid URL';
        }
        break;
      case 'twitter_handle':
        if (value && (value.includes('@') || value.includes('/'))) {
          return 'Enter only the username, without @ or /';
        }
        if (value.length > 15) return 'Twitter username must be 15 characters or less';
        break;
      case 'location':
        if (value.length > 100) return 'Location must be 100 characters or less';
        break;
    }
    return null;
  };

  const handleFieldUpdate = async (field: keyof typeof profile, value: string) => {
    const error = validateField(field, value);
    if (error) {
      toast({
        title: "Validation Error",
        description: error,
        variant: "destructive",
      });
      return;
    }
    
    try {
      await updateProfile({ [field]: value });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || 'Failed to update profile',
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Picture */}
      <Card className="glass-card glow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Profile Picture
          </CardTitle>
          <CardDescription>
            Upload an avatar to personalize your profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24 border-2 border-border">
              <AvatarImage src={previewUrl} />
              <AvatarFallback className="text-2xl bg-primary/10">
                {profile.display_name ? profile.display_name[0].toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex flex-col gap-3">
              <label className="inline-flex">
                <Button 
                  variant="outline" 
                  disabled={uploading || loading}
                  className="cursor-pointer"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Change Avatar'}
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={uploading || loading}
                />
              </label>
              
              {previewUrl && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={removeAvatar}
                  disabled={uploading || loading}
                  className="border-destructive/50 text-destructive hover:bg-destructive/10"
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card className="glass-card glow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Your public profile information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={profile.display_name}
                onChange={(e) => handleFieldUpdate('display_name', e.target.value)}
                placeholder="Your display name"
                disabled={loading}
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">
                {profile.display_name?.length || 0} / 50 characters
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location
              </Label>
              <Input
                id="location"
                value={profile.location}
                onChange={(e) => handleFieldUpdate('location', e.target.value)}
                placeholder="Your location"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => handleFieldUpdate('bio', e.target.value)}
              placeholder="Tell others about yourself..."
              className="min-h-[100px] resize-none"
              maxLength={500}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              {profile.bio?.length || 0} / 500 characters
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card className="glass-card glow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Social Links
          </CardTitle>
          <CardDescription>
            Connect your social media profiles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="website">
              <Globe className="w-4 h-4 inline mr-1" />
              Website
            </Label>
            <Input
              id="website"
              type="url"
              value={profile.website}
              onChange={(e) => handleFieldUpdate('website', e.target.value)}
              placeholder="https://your-website.com"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter">
              <Twitter className="w-4 h-4 inline mr-1" />
              Twitter Handle
            </Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                @
              </span>
              <Input
                id="twitter"
                value={profile.twitter_handle}
                onChange={(e) => handleFieldUpdate('twitter_handle', e.target.value)}
                placeholder="username"
                className="rounded-l-none"
                disabled={loading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Favorite Genres */}
      <Card className="glass-card glow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Favorite Genres
          </CardTitle>
          <CardDescription>
            Select your favorite anime/manga genres to improve recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {GENRE_OPTIONS.map((genre) => {
              const isSelected = profile.favorite_genres?.includes(genre);
              return (
                <Badge
                  key={genre}
                  variant={isSelected ? "default" : "secondary"}
                  className={`cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-primary hover:bg-primary/80' 
                      : 'hover:bg-secondary/80'
                  }`}
                  onClick={() => handleGenreToggle(genre)}
                >
                  {genre}
                  {isSelected && <X className="w-3 h-3 ml-1" />}
                </Badge>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Selected: {profile.favorite_genres?.length || 0} genres
          </p>
        </CardContent>
      </Card>
    </div>
  );
};