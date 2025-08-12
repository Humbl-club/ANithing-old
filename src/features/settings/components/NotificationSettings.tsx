import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSettingsStore } from "@/store/settingsStore";
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Volume2, 
  VolumeX, 
  Calendar,
  Users,
  Trophy,
  Clock,
  AlertTriangle
} from "lucide-react";

export const NotificationSettings = () => {
  const { toast } = useToast();
  const { settings, updateNotifications, resetCategory } = useSettingsStore();
  const { notifications } = settings;

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast({
          title: "Notifications enabled",
          description: "You'll now receive browser notifications.",
        });
        await updateNotifications({ push_notifications: true });
      } else {
        toast({
          title: "Notifications blocked",
          description: "Enable notifications in your browser settings to receive push notifications.",
          variant: "destructive",
        });
      }
    }
  };

  const getNotificationStatus = () => {
    if (!('Notification' in window)) {
      return { status: 'unsupported', text: 'Not supported' };
    }
    
    switch (Notification.permission) {
      case 'granted':
        return { status: 'granted', text: 'Enabled' };
      case 'denied':
        return { status: 'denied', text: 'Blocked' };
      default:
        return { status: 'default', text: 'Not requested' };
    }
  };

  const notificationStatus = getNotificationStatus();

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card className="glass-card glow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Receive updates and alerts via email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Enable all email notifications
              </p>
            </div>
            <Switch
              id="emailNotifications"
              checked={notifications.email_notifications}
              onCheckedChange={(checked) => updateNotifications({ email_notifications: checked })}
            />
          </div>

          <div className={`space-y-4 ${!notifications.email_notifications ? 'opacity-50' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="emailEpisodeRelease">New Episode Releases</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when new episodes of your watching anime are released
                </p>
              </div>
              <Switch
                id="emailEpisodeRelease"
                checked={notifications.email_on_episode_release}
                onCheckedChange={(checked) => updateNotifications({ email_on_episode_release: checked })}
                disabled={!notifications.email_notifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="emailFriendActivity">Friend Activity</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates when friends complete anime or update their lists
                </p>
              </div>
              <Switch
                id="emailFriendActivity"
                checked={notifications.email_on_friend_activity}
                onCheckedChange={(checked) => updateNotifications({ email_on_friend_activity: checked })}
                disabled={!notifications.email_notifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="emailListUpdates">List Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about changes to your anime/manga lists
                </p>
              </div>
              <Switch
                id="emailListUpdates"
                checked={notifications.email_on_list_updates}
                onCheckedChange={(checked) => updateNotifications({ email_on_list_updates: checked })}
                disabled={!notifications.email_notifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="emailWeeklyDigest">Weekly Digest</Label>
                <p className="text-sm text-muted-foreground">
                  Receive a weekly summary of your activity and trending content
                </p>
              </div>
              <Switch
                id="emailWeeklyDigest"
                checked={notifications.email_weekly_digest}
                onCheckedChange={(checked) => updateNotifications({ email_weekly_digest: checked })}
                disabled={!notifications.email_notifications}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card className="glass-card glow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            Push Notifications
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            Receive real-time notifications in your browser
            <Badge 
              variant={notificationStatus.status === 'granted' ? 'default' : 'secondary'}
              className={
                notificationStatus.status === 'granted' 
                  ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                  : notificationStatus.status === 'denied'
                  ? 'bg-red-500/20 text-red-300 border-red-500/30'
                  : 'bg-orange-500/20 text-orange-300 border-orange-500/30'
              }
            >
              {notificationStatus.text}
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="pushNotifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Enable browser notifications
              </p>
            </div>
            <div className="flex items-center gap-2">
              {notificationStatus.status !== 'granted' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={requestNotificationPermission}
                  disabled={notificationStatus.status === 'denied'}
                >
                  {notificationStatus.status === 'denied' ? 'Blocked' : 'Enable'}
                </Button>
              )}
              <Switch
                id="pushNotifications"
                checked={notifications.push_notifications && notificationStatus.status === 'granted'}
                onCheckedChange={(checked) => updateNotifications({ push_notifications: checked })}
                disabled={notificationStatus.status !== 'granted'}
              />
            </div>
          </div>

          {notificationStatus.status === 'denied' && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                <div>
                  <h3 className="font-medium text-destructive mb-1">Notifications Blocked</h3>
                  <p className="text-sm text-muted-foreground">
                    Push notifications are blocked in your browser. To enable them, click the notification icon in your browser's address bar and allow notifications for this site.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className={`space-y-4 ${!notifications.push_notifications || notificationStatus.status !== 'granted' ? 'opacity-50' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="pushEpisodeRelease">New Episode Releases</Label>
                <p className="text-sm text-muted-foreground">
                  Get push notifications for new episodes
                </p>
              </div>
              <Switch
                id="pushEpisodeRelease"
                checked={notifications.push_on_episode_release}
                onCheckedChange={(checked) => updateNotifications({ push_on_episode_release: checked })}
                disabled={!notifications.push_notifications || notificationStatus.status !== 'granted'}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="pushFriendActivity">Friend Activity</Label>
                <p className="text-sm text-muted-foreground">
                  Receive push notifications for friend updates
                </p>
              </div>
              <Switch
                id="pushFriendActivity"
                checked={notifications.push_on_friend_activity}
                onCheckedChange={(checked) => updateNotifications({ push_on_friend_activity: checked })}
                disabled={!notifications.push_notifications || notificationStatus.status !== 'granted'}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="pushAchievements">Achievements</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about unlocked achievements and milestones
                </p>
              </div>
              <Switch
                id="pushAchievements"
                checked={notifications.push_on_achievements}
                onCheckedChange={(checked) => updateNotifications({ push_on_achievements: checked })}
                disabled={!notifications.push_notifications || notificationStatus.status !== 'granted'}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* In-App Notifications */}
      <Card className="glass-card glow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            In-App Notifications
          </CardTitle>
          <CardDescription>
            Control notifications that appear within the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="inAppNotifications">In-App Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Show notification banners and toasts within the app
              </p>
            </div>
            <Switch
              id="inAppNotifications"
              checked={notifications.in_app_notifications}
              onCheckedChange={(checked) => updateNotifications({ in_app_notifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="soundEffects">Sound Effects</Label>
              <p className="text-sm text-muted-foreground">
                Play sound effects for notifications and interactions
              </p>
            </div>
            <Switch
              id="soundEffects"
              checked={notifications.sound_effects}
              onCheckedChange={(checked) => updateNotifications({ sound_effects: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Summary */}
      <Card className="glass-card border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium text-primary mb-2">Notification Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span className={notifications.email_notifications ? 'text-green-400' : 'text-muted-foreground'}>
                    Email: {notifications.email_notifications ? 'On' : 'Off'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  <span className={notifications.push_notifications && notificationStatus.status === 'granted' ? 'text-green-400' : 'text-muted-foreground'}>
                    Push: {notifications.push_notifications && notificationStatus.status === 'granted' ? 'On' : 'Off'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  <span className={notifications.in_app_notifications ? 'text-green-400' : 'text-muted-foreground'}>
                    In-App: {notifications.in_app_notifications ? 'On' : 'Off'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {notifications.sound_effects ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <span className={notifications.sound_effects ? 'text-green-400' : 'text-muted-foreground'}>
                    Sound: {notifications.sound_effects ? 'On' : 'Off'}
                  </span>
                </div>
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
              <h3 className="font-medium">Reset Notification Settings</h3>
              <p className="text-sm text-muted-foreground">
                Restore all notification settings to their default values
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => resetCategory('notifications')}
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