import React, { useState, useCallback, useEffect } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Share, 
  Copy, 
  Mail, 
  MessageCircle, 
  Twitter, 
  Facebook,
  Link as LinkIcon,
  Globe,
  Users,
  Lock,
  UserPlus,
  UserMinus,
  Check,
  X,
  Crown,
  Edit3,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { CustomList, ListCollaborator } from '@/types/userLists';

interface ShareListDialogProps {
  list: CustomList;
  children: React.ReactNode;
  onUpdate?: (updatedList: Partial<CustomList>) => void;
}

interface InviteForm {
  email: string;
  permission: 'viewer' | 'editor';
  message?: string;
}

export function ShareListDialog({ list, children, onUpdate }: ShareListDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [collaborators, setCollaborators] = useState<ListCollaborator[]>([]);
  const [inviteForm, setInviteForm] = useState<InviteForm>({
    email: '',
    permission: 'viewer'
  });
  const [shareUrl, setShareUrl] = useState('');

  // Load collaborators when dialog opens
  useEffect(() => {
    if (open && list.id) {
      loadCollaborators();
      generateShareUrl();
    }
  }, [open, list.id]);

  const loadCollaborators = async () => {
    try {
      const { data, error } = await supabase
        .from('list_collaborators')
        .select(`
          *,
          user:profiles(id, username, avatar_url)
        `)
        .eq('list_id', list.id);

      if (error) throw error;
      setCollaborators(data || []);
    } catch (error) {
      console.error('Error loading collaborators:', error);
    }
  };

  const generateShareUrl = () => {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/lists/shared/${list.share_token}`;
    setShareUrl(url);
  };

  const updateListSettings = async (updates: Partial<CustomList>) => {
    try {
      setIsUpdating(true);
      
      const { error } = await supabase
        .from('custom_lists')
        .update(updates)
        .eq('id', list.id);

      if (error) throw error;
      
      onUpdate?.(updates);
      toast.success('List settings updated');
    } catch (error) {
      console.error('Error updating list:', error);
      toast.error('Failed to update list settings');
    } finally {
      setIsUpdating(false);
    }
  };

  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Check out my ${list.name} list`);
    const body = encodeURIComponent(`I wanted to share my "${list.name}" list with you:\n\n${shareUrl}\n\n${list.description || ''}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaTwitter = () => {
    const text = encodeURIComponent(`Check out my "${list.name}" list`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`);
  };

  const shareViaFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
  };

  const inviteCollaborator = async () => {
    if (!inviteForm.email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      setIsUpdating(true);
      
      // First check if user exists
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('email', inviteForm.email.trim())
        .single();

      if (userError && userError.code !== 'PGRST116') {
        throw userError;
      }

      if (!userData) {
        toast.error('User not found with this email');
        return;
      }

      // Check if already a collaborator
      const existing = collaborators.find(c => c.user_id === userData.id);
      if (existing) {
        toast.error('User is already a collaborator');
        return;
      }

      // Add collaborator
      const { error } = await supabase
        .from('list_collaborators')
        .insert({
          list_id: list.id,
          user_id: userData.id,
          permission_level: inviteForm.permission,
          invited_by: user!.id
        });

      if (error) throw error;
      
      // TODO: Send notification/email to invited user
      
      toast.success(`Invited ${userData.username || inviteForm.email} as ${inviteForm.permission}`);
      setInviteForm({ email: '', permission: 'viewer' });
      await loadCollaborators();
      
    } catch (error) {
      console.error('Error inviting collaborator:', error);
      toast.error('Failed to invite collaborator');
    } finally {
      setIsUpdating(false);
    }
  };

  const updateCollaboratorPermission = async (collaboratorId: string, newPermission: 'viewer' | 'editor') => {
    try {
      const { error } = await supabase
        .from('list_collaborators')
        .update({ permission_level: newPermission })
        .eq('id', collaboratorId);

      if (error) throw error;
      
      setCollaborators(prev => 
        prev.map(c => 
          c.id === collaboratorId 
            ? { ...c, permission_level: newPermission }
            : c
        )
      );
      
      toast.success('Permissions updated');
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast.error('Failed to update permissions');
    }
  };

  const removeCollaborator = async (collaboratorId: string) => {
    try {
      const { error } = await supabase
        .from('list_collaborators')
        .delete()
        .eq('id', collaboratorId);

      if (error) throw error;
      
      setCollaborators(prev => prev.filter(c => c.id !== collaboratorId));
      toast.success('Collaborator removed');
    } catch (error) {
      console.error('Error removing collaborator:', error);
      toast.error('Failed to remove collaborator');
    }
  };

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'editor':
        return <Edit3 className="w-4 h-4 text-blue-500" />;
      case 'viewer':
        return <Eye className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="w-5 h-5" />
            Share "{list.name}"
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Public List</Label>
                  <p className="text-sm text-muted-foreground">
                    Anyone can view this list
                  </p>
                </div>
                <Switch
                  checked={list.is_public}
                  onCheckedChange={(checked) => updateListSettings({ is_public: checked })}
                  disabled={isUpdating}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Collaborative List</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow others to edit this list
                  </p>
                </div>
                <Switch
                  checked={list.is_collaborative}
                  onCheckedChange={(checked) => updateListSettings({ is_collaborative: checked })}
                  disabled={isUpdating}
                />
              </div>
            </CardContent>
          </Card>

          {/* Share Link */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5" />
                Share Link
              </CardTitle>
              <CardDescription>
                Share this link to give others access to your list
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="flex-1"
                />
                <Button onClick={copyShareUrl} variant="outline" size="icon">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={shareViaEmail} variant="outline" size="sm">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
                <Button onClick={shareViaTwitter} variant="outline" size="sm">
                  <Twitter className="w-4 h-4 mr-2" />
                  Twitter
                </Button>
                <Button onClick={shareViaFacebook} variant="outline" size="sm">
                  <Facebook className="w-4 h-4 mr-2" />
                  Facebook
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Collaborators */}
          {list.is_collaborative && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Collaborators
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Invite Form */}
                <div className="p-4 border rounded-lg space-y-3">
                  <h4 className="font-medium">Invite Collaborator</h4>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter email address"
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                      className="flex-1"
                    />
                    <Select
                      value={inviteForm.permission}
                      onValueChange={(value: any) => setInviteForm(prev => ({ ...prev, permission: value }))}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={inviteCollaborator} disabled={isUpdating}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite
                    </Button>
                  </div>
                  
                  {inviteForm.message !== undefined && (
                    <Textarea
                      placeholder="Optional message..."
                      value={inviteForm.message}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, message: e.target.value }))}
                      rows={3}
                    />
                  )}
                </div>

                {/* Collaborator List */}
                <div className="space-y-2">
                  {/* Owner */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user?.user_metadata?.avatar_url} />
                        <AvatarFallback>
                          {user?.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">You</div>
                        <div className="text-sm text-muted-foreground">{user?.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPermissionIcon('owner')}
                      <Badge variant="secondary">Owner</Badge>
                    </div>
                  </div>
                  
                  {/* Other Collaborators */}
                  {collaborators.map((collaborator) => (
                    <div key={collaborator.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={(collaborator.user as any)?.avatar_url} />
                          <AvatarFallback>
                            {(collaborator.user as any)?.username?.charAt(0)?.toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {(collaborator.user as any)?.username || 'Unknown User'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Invited {new Date(collaborator.invited_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getPermissionIcon(collaborator.permission_level)}
                        <Select
                          value={collaborator.permission_level}
                          onValueChange={(value: any) => 
                            updateCollaboratorPermission(collaborator.id, value)
                          }
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">Viewer</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCollaborator(collaborator.id)}
                        >
                          <UserMinus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {collaborators.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No collaborators yet. Invite someone to start collaborating!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}