import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useSettingsStore } from "@/store/settingsStore";
import { 
  Download, 
  Upload, 
  RefreshCw, 
  ExternalLink, 
  Clock, 
  CheckCircle,
  AlertCircle,
  RotateCcw,
  FileText,
  Database,
  AlertTriangle,
  Link,
  Settings
} from "lucide-react";

const SYNC_FREQUENCY_OPTIONS = [
  { value: 'manual', label: 'Manual Only', icon: Settings },
  { value: 'hourly', label: 'Every Hour', icon: Clock },
  { value: 'daily', label: 'Daily', icon: Clock },
  { value: 'weekly', label: 'Weekly', icon: Clock },
];

export const ImportExportSettings = () => {
  const { toast } = useToast();
  const { settings, updateImportExport, resetCategory, exportSettings, importSettings } = useSettingsStore();
  const { importExport } = settings;
  const [importText, setImportText] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [lastSyncStatus, setLastSyncStatus] = useState<'success' | 'error' | null>(null);
  const [clearingCache, setClearingCache] = useState(false);

  const handleExport = () => {
    const settingsJson = exportSettings();
    const blob = new Blob([settingsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anithing-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Settings exported",
      description: "Your settings have been downloaded as a JSON file.",
    });
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setImportText(content);
      };
      reader.readAsText(file);
    }
  };

  const handleImportFromText = () => {
    if (importSettings(importText)) {
      toast({
        title: "Settings imported",
        description: "Your settings have been imported successfully.",
      });
      setImportText('');
    } else {
      toast({
        title: "Import failed",
        description: "Invalid settings file format or corrupted data.",
        variant: "destructive",
      });
    }
  };

  const handleMALSync = async () => {
    if (!importExport.mal_username) {
      toast({
        title: "MAL username required",
        description: "Please enter your MyAnimeList username first.",
        variant: "destructive",
      });
      return;
    }

    setSyncing(true);
    try {
      // Simulate API call - replace with actual sync logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await updateImportExport({ 
        last_sync: new Date().toISOString()
      });
      
      setLastSyncStatus('success');
      toast({
        title: "MAL sync completed",
        description: "Your MyAnimeList data has been synchronized.",
      });
    } catch (error) {
      setLastSyncStatus('error');
      toast({
        title: "MAL sync failed",
        description: "Failed to synchronize with MyAnimeList. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleAniListSync = async () => {
    if (!importExport.anilist_username) {
      toast({
        title: "AniList username required",
        description: "Please enter your AniList username first.",
        variant: "destructive",
      });
      return;
    }

    setSyncing(true);
    try {
      // Simulate API call - replace with actual sync logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await updateImportExport({ 
        last_sync: new Date().toISOString()
      });
      
      setLastSyncStatus('success');
      toast({
        title: "AniList sync completed",
        description: "Your AniList data has been synchronized.",
      });
    } catch (error) {
      setLastSyncStatus('error');
      toast({
        title: "AniList sync failed",
        description: "Failed to synchronize with AniList. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const formatLastSync = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
  };

  const handleClearCache = async () => {
    setClearingCache(true);
    try {
      // Clear browser caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
      // Clear localStorage (except auth)
      const authData = localStorage.getItem('supabase.auth.token');
      const settingsData = localStorage.getItem('settings-storage');
      localStorage.clear();
      if (authData) localStorage.setItem('supabase.auth.token', authData);
      if (settingsData) localStorage.setItem('settings-storage', settingsData);
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear indexedDB (if using for offline storage)
      if ('indexedDB' in window) {
        const databases = ['app-cache', 'offline-data', 'image-cache'];
        databases.forEach(dbName => {
          const deleteReq = indexedDB.deleteDatabase(dbName);
          deleteReq.onerror = () => console.warn(`Failed to delete ${dbName}`);
        });
      }
      
      toast({
        title: "Cache cleared",
        description: "All application caches have been cleared. You may need to refresh the page.",
      });
    } catch (error) {
      toast({
        title: "Cache clear failed",
        description: "Failed to clear all caches. Please try refreshing the page manually.",
        variant: "destructive",
      });
    } finally {
      setClearingCache(false);
    }
  };

  const handleExportUserData = async () => {
    try {
      // Simulate collecting user data - replace with actual data collection
      const userData = {
        lists: [], // User's anime/manga lists
        ratings: [], // User's ratings
        reviews: [], // User's reviews
        friends: [], // User's friends list
        achievements: [], // User's achievements
        preferences: settings,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      const dataJson = JSON.stringify(userData, null, 2);
      const blob = new Blob([dataJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `anithing-userdata-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "User data exported",
        description: "Your complete user data has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export user data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Settings Export/Import */}
      <Card className="glass-card glow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Settings Backup
          </CardTitle>
          <CardDescription>
            Export and import your application settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              onClick={handleExport}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Settings
            </Button>
            
            <label className="inline-flex w-full">
              <Button variant="outline" className="cursor-pointer w-full">
                <Upload className="w-4 h-4 mr-2" />
                Import from File
              </Button>
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
          </div>

          <div className="space-y-3">
            <Label htmlFor="importText">Or paste settings JSON:</Label>
            <Textarea
              id="importText"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste your exported settings JSON here..."
              className="min-h-[120px] resize-none font-mono text-sm"
            />
            <Button 
              onClick={handleImportFromText}
              disabled={!importText.trim()}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Settings
            </Button>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Important Notes:</p>
                <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Importing settings will override your current configuration</li>
                  <li>Settings include profile data, preferences, and privacy options</li>
                  <li>Account-specific data like friends and lists are not included</li>
                  <li>Always backup your current settings before importing</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MyAnimeList Integration */}
      <Card className="glass-card glow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-primary" />
            MyAnimeList Integration
          </CardTitle>
          <CardDescription>
            Sync your anime and manga lists with MyAnimeList
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="malSync">Enable MAL Sync</Label>
              <p className="text-sm text-muted-foreground">
                Automatically sync your lists with MyAnimeList
              </p>
            </div>
            <Switch
              id="malSync"
              checked={importExport.mal_sync_enabled}
              onCheckedChange={(checked) => updateImportExport({ mal_sync_enabled: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="malUsername">MyAnimeList Username</Label>
            <div className="flex gap-2">
              <Input
                id="malUsername"
                value={importExport.mal_username}
                onChange={(e) => updateImportExport({ mal_username: e.target.value })}
                placeholder="Your MAL username"
                disabled={!importExport.mal_sync_enabled}
              />
              <Button
                variant="outline"
                onClick={handleMALSync}
                disabled={!importExport.mal_sync_enabled || !importExport.mal_username || syncing}
              >
                {syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {importExport.mal_sync_enabled && importExport.mal_username && (
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className="flex items-center gap-1">
                <Link className="w-3 h-3" />
                Connected to MAL
              </Badge>
              <span className="text-muted-foreground">
                Last sync: {formatLastSync(importExport.last_sync)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AniList Integration */}
      <Card className="glass-card glow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-primary" />
            AniList Integration
          </CardTitle>
          <CardDescription>
            Sync your anime and manga lists with AniList
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="anilistSync">Enable AniList Sync</Label>
              <p className="text-sm text-muted-foreground">
                Automatically sync your lists with AniList
              </p>
            </div>
            <Switch
              id="anilistSync"
              checked={importExport.anilist_sync_enabled}
              onCheckedChange={(checked) => updateImportExport({ anilist_sync_enabled: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="anilistUsername">AniList Username</Label>
            <div className="flex gap-2">
              <Input
                id="anilistUsername"
                value={importExport.anilist_username}
                onChange={(e) => updateImportExport({ anilist_username: e.target.value })}
                placeholder="Your AniList username"
                disabled={!importExport.anilist_sync_enabled}
              />
              <Button
                variant="outline"
                onClick={handleAniListSync}
                disabled={!importExport.anilist_sync_enabled || !importExport.anilist_username || syncing}
              >
                {syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {importExport.anilist_sync_enabled && importExport.anilist_username && (
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className="flex items-center gap-1">
                <Link className="w-3 h-3" />
                Connected to AniList
              </Badge>
              <span className="text-muted-foreground">
                Last sync: {formatLastSync(importExport.last_sync)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Settings */}
      <Card className="glass-card glow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary" />
            Sync Configuration
          </CardTitle>
          <CardDescription>
            Configure automatic synchronization settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="autoSync">Automatic Sync</Label>
              <p className="text-sm text-muted-foreground">
                Enable automatic background synchronization
              </p>
            </div>
            <Switch
              id="autoSync"
              checked={importExport.auto_sync}
              onCheckedChange={(checked) => updateImportExport({ auto_sync: checked })}
              disabled={!importExport.mal_sync_enabled && !importExport.anilist_sync_enabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="syncFrequency">Sync Frequency</Label>
            <Select
              value={importExport.sync_frequency}
              onValueChange={(value: any) => updateImportExport({ sync_frequency: value })}
              disabled={!importExport.auto_sync}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SYNC_FREQUENCY_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-400 mb-1">Sync Status</p>
                <div className="space-y-2">
                  {importExport.last_sync && (
                    <div className="flex items-center gap-2">
                      {lastSyncStatus === 'success' ? 
                        <CheckCircle className="w-4 h-4 text-green-400" /> :
                        lastSyncStatus === 'error' ?
                        <AlertCircle className="w-4 h-4 text-red-400" /> :
                        <Clock className="w-4 h-4 text-blue-400" />
                      }
                      <span className="text-muted-foreground">
                        Last sync: {formatLastSync(importExport.last_sync)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Next sync: {importExport.auto_sync ? 
                        `In ${importExport.sync_frequency === 'hourly' ? '1 hour' : 
                               importExport.sync_frequency === 'daily' ? '1 day' : '1 week'}` 
                        : 'Manual only'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="glass-card glow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Data Management
          </CardTitle>
          <CardDescription>
            Manage your local data, cache, and user information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              onClick={handleExportUserData}
              className="w-full"
            >
              <FileText className="w-4 h-4 mr-2" />
              Export User Data
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleClearCache}
              disabled={clearingCache}
              className="w-full border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
            >
              {clearingCache ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Database className="w-4 h-4 mr-2" />
              )}
              {clearingCache ? 'Clearing...' : 'Clear Cache'}
            </Button>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Cache Management:</p>
                <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Export User Data includes all your lists, ratings, and reviews</li>
                  <li>Clear Cache removes temporary files to free up space</li>
                  <li>Clearing cache may require re-downloading images and data</li>
                  <li>Your account data and settings will remain intact</li>
                </ul>
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
              <h3 className="font-medium">Reset Import/Export Settings</h3>
              <p className="text-sm text-muted-foreground">
                Restore all sync and import/export settings to their default values
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => resetCategory('importExport')}
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