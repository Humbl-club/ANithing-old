import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSettingsStore } from "@/store/settingsStore";
import { Shield, Users, Eye, EyeOff, Activity, User, Globe, Database, UserCheck, Settings, AlertTriangle } from "lucide-react";

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public', description: 'Anyone can see', icon: Globe },
  { value: 'friends', label: 'Friends Only', description: 'Only your friends can see', icon: Users },
  { value: 'private', label: 'Private', description: 'Only you can see', icon: EyeOff },
];

export const PrivacySettings = () => {
  const { settings, updatePrivacy, resetCategory } = useSettingsStore();
  const { privacy } = settings;

  const getVisibilityIcon = (visibility: string) => {
    const option = VISIBILITY_OPTIONS.find(opt => opt.value === visibility);
    return option ? option.icon : Eye;
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'text-green-400 border-green-400/30 bg-green-400/10';
      case 'friends': return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
      case 'private': return 'text-orange-400 border-orange-400/30 bg-orange-400/10';
      default: return 'text-gray-400 border-gray-400/30 bg-gray-400/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Visibility */}
      <Card className="glass-card glow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Profile Visibility
          </CardTitle>
          <CardDescription>
            Control who can see your profile and personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="profileVisibility">Profile Visibility</Label>
            <Select
              value={privacy.profile_visibility}
              onValueChange={(value: 'public' | 'private' | 'friends') => 
                updatePrivacy({ profile_visibility: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VISIBILITY_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <div>
                          <span className="font-medium">{option.label}</span>
                          <p className="text-xs text-muted-foreground">{option.description}</p>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="listVisibility">List Visibility</Label>
            <Select
              value={privacy.list_visibility}
              onValueChange={(value: 'public' | 'private' | 'friends') => 
                updatePrivacy({ list_visibility: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VISIBILITY_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <div>
                          <span className="font-medium">{option.label}</span>
                          <p className="text-xs text-muted-foreground">{option.description}</p>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activityVisibility">Activity Visibility</Label>
            <Select
              value={privacy.activity_visibility}
              onValueChange={(value: 'public' | 'private' | 'friends') => 
                updatePrivacy({ activity_visibility: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VISIBILITY_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <div>
                          <span className="font-medium">{option.label}</span>
                          <p className="text-xs text-muted-foreground">{option.description}</p>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Sharing */}
      <Card className="glass-card glow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Data Sharing & Display
          </CardTitle>
          <CardDescription>
            Choose what information is shared and displayed publicly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="showProgress">Show Watch Progress</Label>
              <p className="text-sm text-muted-foreground">
                Display your episode/chapter progress on your lists
              </p>
            </div>
            <Switch
              id="showProgress"
              checked={privacy.show_progress}
              onCheckedChange={(checked) => updatePrivacy({ show_progress: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="showRatings">Show Ratings & Scores</Label>
              <p className="text-sm text-muted-foreground">
                Display your ratings and scores publicly
              </p>
            </div>
            <Switch
              id="showRatings"
              checked={privacy.show_ratings}
              onCheckedChange={(checked) => updatePrivacy({ show_ratings: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="showReviews">Show Reviews</Label>
              <p className="text-sm text-muted-foreground">
                Allow others to see your written reviews and comments
              </p>
            </div>
            <Switch
              id="showReviews"
              checked={privacy.show_reviews}
              onCheckedChange={(checked) => updatePrivacy({ show_reviews: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Features */}
      <Card className="glass-card glow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Social Features
          </CardTitle>
          <CardDescription>
            Control how others can interact with you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="allowFriendRequests">Allow Friend Requests</Label>
              <p className="text-sm text-muted-foreground">
                Let other users send you friend requests
              </p>
            </div>
            <Switch
              id="allowFriendRequests"
              checked={privacy.allow_friend_requests}
              onCheckedChange={(checked) => updatePrivacy({ allow_friend_requests: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="showOnlineStatus">Show Online Status</Label>
              <p className="text-sm text-muted-foreground">
                Display when you're actively using the platform
              </p>
            </div>
            <Switch
              id="showOnlineStatus"
              checked={privacy.show_online_status}
              onCheckedChange={(checked) => updatePrivacy({ show_online_status: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Collection & Analytics */}
      <Card className="glass-card glow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Data Collection & Analytics
          </CardTitle>
          <CardDescription>
            Control how your data is collected and used for improvements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="dataCollection">Anonymous Analytics</Label>
              <p className="text-sm text-muted-foreground">
                Help improve the platform by sharing anonymous usage data
              </p>
            </div>
            <Switch
              id="dataCollection"
              checked={privacy.data_collection}
              onCheckedChange={(checked) => updatePrivacy({ data_collection: checked })}
            />
          </div>

          <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">What data do we collect?</p>
                <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Page views and feature usage (anonymized)</li>
                  <li>Performance metrics to improve loading times</li>
                  <li>Error reports to fix bugs faster</li>
                  <li>General preferences to enhance user experience</li>
                </ul>
                <p className="text-muted-foreground mt-2">
                  We never collect personal information without your explicit consent.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Summary */}
      <Card className="glass-card border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-primary mb-3">Privacy Summary</h3>
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Profile Visibility:</span>
                  <Badge className={`${getVisibilityColor(privacy.profile_visibility)}`}>
                    {VISIBILITY_OPTIONS.find(opt => opt.value === privacy.profile_visibility)?.label}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">List Visibility:</span>
                  <Badge className={`${getVisibilityColor(privacy.list_visibility)}`}>
                    {VISIBILITY_OPTIONS.find(opt => opt.value === privacy.list_visibility)?.label}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Activity Visibility:</span>
                  <Badge className={`${getVisibilityColor(privacy.activity_visibility)}`}>
                    {VISIBILITY_OPTIONS.find(opt => opt.value === privacy.activity_visibility)?.label}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Friend Requests:</span>
                  <Badge variant={privacy.allow_friend_requests ? "default" : "secondary"}>
                    {privacy.allow_friend_requests ? 'Allowed' : 'Disabled'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Card className="glass-card border-blue-500/20 bg-blue-500/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-400 mb-2">Privacy Protection</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                We take your privacy seriously. Your data is encrypted and never shared with third parties 
                without your explicit consent. You have full control over your information and can modify 
                or delete it at any time.
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>• End-to-end encryption</span>
                <span>• GDPR compliant</span>
                <span>• No third-party tracking</span>
                <span>• Right to be forgotten</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reset Section */}
      <Card className="glass-card border-border/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Reset Privacy Settings</h3>
              <p className="text-sm text-muted-foreground">
                Restore all privacy settings to their default values
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => resetCategory('privacy')}
              className="border-destructive/50 text-destructive hover:bg-destructive/10"
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};