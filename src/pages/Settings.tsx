import { useState, useEffect } from "react";
import { Navigation } from "@/layouts/components/Navigation";
import { EmailVerificationBanner } from "@/features/user/components/EmailVerificationBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSettingsStore } from "@/store/settingsStore";

// Import all settings components
import { ProfileSettings } from "@/features/settings/components/ProfileSettings";
import { PreferenceSettings } from "@/features/settings/components/PreferenceSettings";
import { NotificationSettings } from "@/features/settings/components/NotificationSettings";
import { PrivacySettings } from "@/features/settings/components/PrivacySettings";
import { AccountSettings } from "@/features/settings/components/AccountSettings";
import { ImportExportSettings } from "@/features/settings/components/ImportExportSettings";

import { 
  Settings as SettingsIcon, 
  User,
  Palette, 
  Bell, 
  Shield, 
  UserCheck,
  Download,
  Save, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle
} from "lucide-react";

const Settings = () => {
  const { toast } = useToast();
  const { 
    hasChanges, 
    loading, 
    resetAllSettings, 
    exportSettings, 
    importSettings,
    saveToSupabase,
    markSaved,
    loadSettings
  } = useSettingsStore();
  
  const [activeTab, setActiveTab] = useState("profile");
  const [importText, setImportText] = useState("");

  useEffect(() => {
    // Load settings when component mounts
    loadSettings();
  }, [loadSettings]);

  const handleSave = async () => {
    try {
      await saveToSupabase();
      markSaved();
      toast({
        title: "Settings saved",
        description: "Your preferences have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    resetAllSettings();
    toast({
      title: "Settings reset",
      description: "All settings have been reset to defaults.",
    });
  };

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

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (importSettings(content)) {
          toast({
            title: "Settings imported",
            description: "Your settings have been imported successfully.",
          });
        } else {
          toast({
            title: "Import failed",
            description: "Invalid settings file format.",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <EmailVerificationBanner />
      
      {/* Header */}
      <div className="relative pt-24 pb-12 mb-8">
        <div className="absolute inset-0 bg-gradient-hero"></div>
        <div className="relative container mx-auto px-4">
          <div className="glass-card p-8 border border-primary/20 glow-primary">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <SettingsIcon className="w-8 h-8 text-primary" />
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gradient-primary">
                  Settings
                </h1>
              </div>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Customize your <span className="text-gradient-primary font-semibold">Anithing</span> experience to match your preferences.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto mobile-safe-padding py-6 md:py-8">
        {/* Quick Actions */}
        <Card className="mb-8 glass-card glow-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Quick Actions</span>
              {hasChanges && (
                <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Unsaved Changes
                </Badge>
              )}
              {loading && (
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  Saving...
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={handleSave} 
                disabled={!hasChanges || loading}
                className="bg-gradient-primary hover:shadow-glow-primary"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleReset}
                disabled={loading}
                className="border-destructive/50 text-destructive hover:bg-destructive/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset All
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleExport}
                disabled={loading}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              
              <label className="inline-flex">
                <Button variant="outline" className="cursor-pointer" disabled={loading}>
                  <Download className="w-4 h-4 mr-2" />
                  Import
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 max-w-4xl mx-auto mb-8 bg-card/50 backdrop-blur-md border border-border/30 p-2 rounded-xl">
            <TabsTrigger 
              value="profile" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground rounded-lg transition-all duration-300"
            >
              <User className="w-4 h-4 mr-2 lg:mr-2" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="preferences"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground rounded-lg transition-all duration-300"
            >
              <Palette className="w-4 h-4 mr-2 lg:mr-2" />
              <span className="hidden sm:inline">Display</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="notifications"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground rounded-lg transition-all duration-300"
            >
              <Bell className="w-4 h-4 mr-2 lg:mr-2" />
              <span className="hidden sm:inline">Notify</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="privacy"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground rounded-lg transition-all duration-300"
            >
              <Shield className="w-4 h-4 mr-2 lg:mr-2" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="account"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground rounded-lg transition-all duration-300"
            >
              <UserCheck className="w-4 h-4 mr-2 lg:mr-2" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="import-export"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-primary-foreground rounded-lg transition-all duration-300"
            >
              <Download className="w-4 h-4 mr-2 lg:mr-2" />
              <span className="hidden sm:inline">Sync</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-8">
            <ProfileSettings />
          </TabsContent>
          
          <TabsContent value="preferences" className="mt-8">
            <PreferenceSettings />
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-8">
            <NotificationSettings />
          </TabsContent>
          
          <TabsContent value="privacy" className="mt-8">
            <PrivacySettings />
          </TabsContent>
          
          <TabsContent value="account" className="mt-8">
            <AccountSettings />
          </TabsContent>
          
          <TabsContent value="import-export" className="mt-8">
            <ImportExportSettings />
          </TabsContent>
        </Tabs>

        {/* Settings Summary Card */}
        <Card className="mt-8 glass-card border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium text-primary mb-2">Settings Overview</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  Your settings are automatically saved locally and synced to the cloud when you click "Save Changes". 
                  You can export your settings as a backup or import them on other devices.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-muted-foreground">
                  <div>🔄 Auto-sync: {hasChanges ? 'Pending' : 'Up to date'}</div>
                  <div>🛡️ Privacy: Encrypted</div>
                  <div>📱 Cross-device: Supported</div>
                  <div>💾 Backup: Available</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;