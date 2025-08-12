import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useSettingsStore } from "@/store/settingsStore";
import { supabase } from "@/lib/supabaseClient";
import { 
  User, 
  Mail, 
  Lock, 
  Shield, 
  Bell,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Trash2,
  LogOut,
  Settings
} from "lucide-react";

export const AccountSettings = () => {
  const { toast } = useToast();
  const { settings, updateAccount } = useSettingsStore();
  const { account } = settings;
  const [loading, setLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [showDeleteSection, setShowDeleteSection] = useState(false);

  useEffect(() => {
    checkEmailVerification();
  }, []);

  const checkEmailVerification = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmailVerified(user.email_confirmed_at !== null);
        await updateAccount({ 
          email: user.email || '',
          username: user.user_metadata?.username || ''
        });
      }
    } catch (error) {
      console.error('Error checking email verification:', error);
    }
  };

  const handleEmailUpdate = async (newEmail: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      
      if (error) throw error;

      await updateAccount({ email: newEmail });
      toast({
        title: "Email update initiated",
        description: "Please check both your old and new email addresses for confirmation links.",
      });
    } catch (error: any) {
      toast({
        title: "Email update failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both password fields are identical.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });
      
      if (error) throw error;

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Password update failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerificationEmail = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: account.email
      });

      if (error) throw error;

      toast({
        title: "Verification email sent",
        description: "Please check your email for the verification link.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to send verification email",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccountDeletion = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast({
        title: "Confirmation required",
        description: "Please type 'DELETE' to confirm account deletion.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Mark account for deletion - this would typically trigger a cleanup process
      await updateAccount({ account_deletion_requested: true });
      
      // In a real implementation, you might:
      // 1. Send an email confirmation
      // 2. Set a grace period
      // 3. Actually delete the account after confirmation
      
      toast({
        title: "Account deletion requested",
        description: "Your account has been marked for deletion. You'll receive an email with further instructions.",
        variant: "destructive",
      });
      
      setDeleteConfirmation('');
      setShowDeleteSection(false);
      
    } catch (error: any) {
      toast({
        title: "Account deletion failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Redirect will be handled by auth context
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Information */}
      <Card className="glass-card glow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Account Information
          </CardTitle>
          <CardDescription>
            Manage your account details and authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="flex items-center gap-2">
              <Input
                id="email"
                type="email"
                value={account.email}
                onChange={(e) => updateAccount({ email: e.target.value })}
                placeholder="your-email@example.com"
                disabled={loading}
              />
              <Badge 
                variant={emailVerified ? "default" : "secondary"}
                className={emailVerified 
                  ? "bg-green-500/20 text-green-300 border-green-500/30" 
                  : "bg-orange-500/20 text-orange-300 border-orange-500/30"
                }
              >
                {emailVerified ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Unverified
                  </>
                )}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEmailUpdate(account.email)}
                disabled={loading}
              >
                Update Email
              </Button>
              {!emailVerified && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSendVerificationEmail}
                  disabled={loading}
                >
                  Resend Verification
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={account.username}
              onChange={(e) => updateAccount({ username: e.target.value })}
              placeholder="Your username"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Your username is used for your public profile URL
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Password & Security */}
      <Card className="glass-card glow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Password & Security
          </CardTitle>
          <CardDescription>
            Update your password and security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type={showPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                disabled={loading}
              />
            </div>

            <Button
              onClick={handlePasswordUpdate}
              disabled={!currentPassword || !newPassword || !confirmPassword || loading}
              className="w-full"
            >
              Update Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Options */}
      <Card className="glass-card glow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Security Options
          </CardTitle>
          <CardDescription>
            Additional security features for your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                Coming Soon
              </Badge>
              <Switch
                id="twoFactor"
                checked={account.two_factor_enabled}
                onCheckedChange={(checked) => updateAccount({ two_factor_enabled: checked })}
                disabled={true} // Disabled until implementation is ready
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="loginAlerts">Login Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified of new login attempts to your account
              </p>
            </div>
            <Switch
              id="loginAlerts"
              checked={account.login_alerts}
              onCheckedChange={(checked) => updateAccount({ login_alerts: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="glass-card glow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Account Actions
          </CardTitle>
          <CardDescription>
            General account management options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="glass-card border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that affect your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!showDeleteSection ? (
            <Button
              variant="outline"
              onClick={() => setShowDeleteSection(true)}
              className="border-destructive/50 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                  <div className="text-sm">
                    <h3 className="font-medium text-destructive mb-2">This action cannot be undone</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Deleting your account will permanently remove all your data including:
                    </p>
                    <ul className="mt-2 text-muted-foreground list-disc list-inside space-y-1">
                      <li>Your profile and all personal information</li>
                      <li>All your anime and manga lists</li>
                      <li>Reviews, ratings, and comments</li>
                      <li>Friends and social connections</li>
                      <li>Settings and preferences</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deleteConfirm">
                  Type "DELETE" to confirm account deletion:
                </Label>
                <Input
                  id="deleteConfirm"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="DELETE"
                  disabled={loading}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={handleAccountDeletion}
                  disabled={deleteConfirmation !== 'DELETE' || loading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account Permanently
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteSection(false);
                    setDeleteConfirmation('');
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {account.account_deletion_requested && (
            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-orange-400 mb-1">Account Deletion Requested</h3>
                  <p className="text-sm text-muted-foreground">
                    Your account has been marked for deletion. You should receive an email with instructions 
                    to complete the process. You can still cancel this request by contacting support.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};