import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useSettingsStore } from "@/store/settingsStore";
import { 
  Palette, 
  Globe, 
  Eye, 
  EyeOff, 
  Layout, 
  Zap, 
  Sparkles, 
  Database,
  Monitor,
  Sun,
  Moon,
  Languages,
  Filter,
  Grid3X3,
  List,
  Table
} from "lucide-react";

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'ja', label: '日本語', flag: '🇯🇵' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { value: 'ko', label: '한국어', flag: '🇰🇷' },
  { value: 'zh', label: '中文', flag: '🇨🇳' },
];

const TITLE_LANGUAGE_OPTIONS = [
  { value: 'english', label: 'English', icon: Globe },
  { value: 'romaji', label: 'Romaji', icon: Languages },
  { value: 'native', label: 'Native', icon: Languages },
];

const CONTENT_FILTER_OPTIONS = [
  { value: 'all', label: 'All Content', description: 'Show all anime and manga' },
  { value: 'no_adult', label: 'No Adult Content', description: 'Hide adult/NSFW content' },
  { value: 'family_friendly', label: 'Family Friendly', description: 'Only show family-appropriate content' },
];

const VIEW_OPTIONS = [
  { value: 'grid', label: 'Grid View', icon: Grid3X3 },
  { value: 'list', label: 'List View', icon: List },
  { value: 'table', label: 'Table View', icon: Table },
];

const ITEMS_PER_PAGE_OPTIONS = [12, 24, 48, 96];

export const PreferenceSettings = () => {
  const { settings, updatePreferences } = useSettingsStore();
  const { preferences } = settings;

  return (
    <div className="space-y-6">
      {/* Theme & Appearance */}
      <Card className="glass-card glow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Theme & Appearance
          </CardTitle>
          <CardDescription>
            Customize the visual appearance of the interface
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="theme">Color Theme</Label>
              <Select
                value={preferences.theme}
                onValueChange={(value: 'light' | 'dark' | 'system') => 
                  updatePreferences({ theme: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4" />
                      Light Mode
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4" />
                      Dark Mode
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      System Default
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Interface Language</Label>
              <Select
                value={preferences.language}
                onValueChange={(value: any) => 
                  updatePreferences({ language: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      <div className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        {lang.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Title Language Preference</Label>
            <div className="flex flex-wrap gap-2">
              {TITLE_LANGUAGE_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = preferences.title_language === option.value;
                return (
                  <Badge
                    key={option.value}
                    variant={isSelected ? "default" : "secondary"}
                    className={`cursor-pointer transition-colors px-4 py-2 ${
                      isSelected 
                        ? 'bg-primary hover:bg-primary/80' 
                        : 'hover:bg-secondary/80'
                    }`}
                    onClick={() => updatePreferences({ title_language: option.value as any })}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {option.label}
                  </Badge>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Choose how anime/manga titles are displayed
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Content & Display */}
      <Card className="glass-card glow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="w-5 h-5 text-primary" />
            Content & Display
          </CardTitle>
          <CardDescription>
            Configure how content is displayed and filtered
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Content Filter</Label>
            <div className="grid gap-3">
              {CONTENT_FILTER_OPTIONS.map((option) => {
                const isSelected = preferences.content_filter === option.value;
                return (
                  <div
                    key={option.value}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => updatePreferences({ content_filter: option.value as any })}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-primary bg-primary' : 'border-border'
                      }`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div>
                        <p className="font-medium">{option.label}</p>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Default List View</Label>
              <div className="flex gap-2">
                {VIEW_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = preferences.default_list_view === option.value;
                  return (
                    <Badge
                      key={option.value}
                      variant={isSelected ? "default" : "secondary"}
                      className={`cursor-pointer transition-colors px-3 py-2 ${
                        isSelected 
                          ? 'bg-primary hover:bg-primary/80' 
                          : 'hover:bg-secondary/80'
                      }`}
                      onClick={() => updatePreferences({ default_list_view: option.value as any })}
                    >
                      <Icon className="w-4 h-4 mr-1" />
                      {option.label.replace(' View', '')}
                    </Badge>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Items Per Page</Label>
              <Select
                value={preferences.items_per_page.toString()}
                onValueChange={(value) => 
                  updatePreferences({ items_per_page: parseInt(value) as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ITEMS_PER_PAGE_OPTIONS.map((count) => (
                    <SelectItem key={count} value={count.toString()}>
                      {count} items
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visual Effects */}
      <Card className="glass-card glow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Visual Effects & Behavior
          </CardTitle>
          <CardDescription>
            Control animations and interactive elements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="autoPlayTrailers">Auto-play Trailers</Label>
              <p className="text-sm text-muted-foreground">
                Automatically play video trailers when viewing details
              </p>
            </div>
            <Switch
              id="autoPlayTrailers"
              checked={preferences.auto_play_trailers}
              onCheckedChange={(checked) => updatePreferences({ auto_play_trailers: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="showSpoilers">Show Spoiler Content</Label>
              <p className="text-sm text-muted-foreground">
                Display spoiler content in reviews and discussions
              </p>
            </div>
            <Switch
              id="showSpoilers"
              checked={preferences.show_spoilers}
              onCheckedChange={(checked) => updatePreferences({ show_spoilers: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="compactMode">Compact Mode</Label>
              <p className="text-sm text-muted-foreground">
                Reduce spacing and use smaller elements for more content density
              </p>
            </div>
            <Switch
              id="compactMode"
              checked={preferences.compact_mode}
              onCheckedChange={(checked) => updatePreferences({ compact_mode: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="glassmorphism">Glassmorphism Effects</Label>
              <p className="text-sm text-muted-foreground">
                Enable glass-like transparency effects on cards and panels
              </p>
            </div>
            <Switch
              id="glassmorphism"
              checked={preferences.glassmorphism}
              onCheckedChange={(checked) => updatePreferences({ glassmorphism: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="animations">Smooth Animations</Label>
              <p className="text-sm text-muted-foreground">
                Enable smooth transitions and animations throughout the app
              </p>
            </div>
            <Switch
              id="animations"
              checked={preferences.animations}
              onCheckedChange={(checked) => updatePreferences({ animations: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="dataSaver">Data Saver Mode</Label>
              <p className="text-sm text-muted-foreground">
                Reduce bandwidth usage by limiting image quality and auto-loading
              </p>
            </div>
            <Switch
              id="dataSaver"
              checked={preferences.data_saver}
              onCheckedChange={(checked) => updatePreferences({ data_saver: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};