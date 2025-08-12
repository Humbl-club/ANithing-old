import React, { useState } from 'react';
import { BaseContent } from '@/types/content.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ExternalLink, 
  Play, 
  Download, 
  Star, 
  MapPin,
  DollarSign,
  Clock,
  Globe,
  Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreamingProvider {
  id: string;
  name: string;
  logo: string;
  url: string;
  type: 'subscription' | 'free' | 'rental' | 'purchase';
  price?: string;
  quality: 'HD' | '4K' | 'SD';
  regions: string[];
  hasDownload: boolean;
  rating?: number;
  subtitle_languages?: string[];
  audio_languages?: string[];
}

interface StreamingProvidersProps {
  content: BaseContent;
  contentType: 'anime' | 'manga';
}

// Mock streaming providers data
const mockProviders: StreamingProvider[] = [
  {
    id: 'crunchyroll',
    name: 'Crunchyroll',
    logo: '/streaming-logos/crunchyroll.png',
    url: 'https://crunchyroll.com',
    type: 'subscription',
    price: '$9.99/month',
    quality: '4K',
    regions: ['US', 'CA', 'UK', 'AU'],
    hasDownload: true,
    rating: 4.2,
    subtitle_languages: ['English', 'Spanish', 'French', 'German'],
    audio_languages: ['Japanese', 'English']
  },
  {
    id: 'funimation',
    name: 'Funimation',
    logo: '/streaming-logos/funimation.png',
    url: 'https://funimation.com',
    type: 'subscription',
    price: '$7.99/month',
    quality: 'HD',
    regions: ['US', 'CA', 'UK'],
    hasDownload: true,
    rating: 4.0,
    subtitle_languages: ['English', 'Spanish'],
    audio_languages: ['Japanese', 'English']
  },
  {
    id: 'netflix',
    name: 'Netflix',
    logo: '/streaming-logos/netflix.png',
    url: 'https://netflix.com',
    type: 'subscription',
    price: '$15.99/month',
    quality: '4K',
    regions: ['US', 'CA', 'UK', 'AU', 'JP'],
    hasDownload: true,
    rating: 4.5,
    subtitle_languages: ['English', 'Spanish', 'French', 'German', 'Japanese'],
    audio_languages: ['Japanese', 'English']
  },
  {
    id: 'hulu',
    name: 'Hulu',
    logo: '/streaming-logos/hulu.png',
    url: 'https://hulu.com',
    type: 'subscription',
    price: '$12.99/month',
    quality: 'HD',
    regions: ['US'],
    hasDownload: false,
    rating: 3.8,
    subtitle_languages: ['English', 'Spanish'],
    audio_languages: ['Japanese', 'English']
  },
  {
    id: 'amazon-prime',
    name: 'Amazon Prime Video',
    logo: '/streaming-logos/amazon.png',
    url: 'https://primevideo.com',
    type: 'rental',
    price: '$3.99/episode',
    quality: '4K',
    regions: ['US', 'CA', 'UK', 'AU', 'DE'],
    hasDownload: true,
    rating: 4.3,
    subtitle_languages: ['English', 'Spanish', 'French'],
    audio_languages: ['Japanese', 'English']
  },
  {
    id: 'youtube',
    name: 'YouTube Movies',
    logo: '/streaming-logos/youtube.png',
    url: 'https://youtube.com',
    type: 'purchase',
    price: '$9.99/season',
    quality: 'HD',
    regions: ['US', 'CA', 'UK', 'AU'],
    hasDownload: false,
    rating: 3.5,
    subtitle_languages: ['English'],
    audio_languages: ['Japanese', 'English']
  }
];

export function StreamingProviders({ content, contentType }: StreamingProvidersProps) {
  const [selectedRegion, setSelectedRegion] = useState('US');
  const [selectedTab, setSelectedTab] = useState('streaming');

  // Filter providers by region
  const availableProviders = mockProviders.filter(provider => 
    provider.regions.includes(selectedRegion)
  );

  // Group providers by type
  const providersByType = {
    subscription: availableProviders.filter(p => p.type === 'subscription'),
    free: availableProviders.filter(p => p.type === 'free'),
    rental: availableProviders.filter(p => p.type === 'rental'),
    purchase: availableProviders.filter(p => p.type === 'purchase'),
  };

  const regions = ['US', 'CA', 'UK', 'AU', 'JP', 'DE', 'FR'];

  const ProviderCard = ({ provider }: { provider: StreamingProvider }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <img 
              src={provider.logo} 
              alt={provider.name}
              className="w-8 h-8 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold truncate">{provider.name}</h4>
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm">{provider.rating}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant={provider.type === 'free' ? 'default' : 'secondary'}
                className={cn(
                  "text-xs capitalize",
                  provider.type === 'free' && "bg-green-100 text-green-800",
                  provider.type === 'subscription' && "bg-blue-100 text-blue-800",
                  provider.type === 'rental' && "bg-orange-100 text-orange-800",
                  provider.type === 'purchase' && "bg-purple-100 text-purple-800"
                )}
              >
                {provider.type}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {provider.quality}
              </Badge>
              {provider.hasDownload && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  Download
                </Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                <span>{provider.price || 'Free'}</span>
              </div>
              <Button size="sm" asChild>
                <a 
                  href={provider.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Watch
                  <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Language support */}
        <div className="mt-3 pt-3 border-t border-border/50">
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>
              <span className="font-medium">Audio:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {provider.audio_languages?.map(lang => (
                  <Badge key={lang} variant="outline" className="text-xs">
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <span className="font-medium">Subtitles:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {provider.subtitle_languages?.slice(0, 3).map(lang => (
                  <Badge key={lang} variant="outline" className="text-xs">
                    {lang}
                  </Badge>
                ))}
                {provider.subtitle_languages && provider.subtitle_languages.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{provider.subtitle_languages.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const StreamingTab = () => (
    <div className="space-y-6">
      {/* Region selector */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Streaming Availability</h3>
          <p className="text-sm text-muted-foreground">
            Legal streaming platforms where you can watch this {contentType}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <select 
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-background border border-input rounded-md px-3 py-1 text-sm"
          >
            {regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Subscription services */}
      {providersByType.subscription.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Subscription Services
          </h4>
          <div className="grid gap-4">
            {providersByType.subscription.map(provider => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        </div>
      )}

      {/* Free services */}
      {providersByType.free.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Free with Ads
          </h4>
          <div className="grid gap-4">
            {providersByType.free.map(provider => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        </div>
      )}

      {/* Rental/Purchase services */}
      {(providersByType.rental.length > 0 || providersByType.purchase.length > 0) && (
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Rent or Buy
          </h4>
          <div className="grid gap-4">
            {[...providersByType.rental, ...providersByType.purchase].map(provider => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        </div>
      )}

      {availableProviders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No streaming services available in {selectedRegion} for this {contentType}.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Try selecting a different region or check back later.
          </p>
        </div>
      )}
    </div>
  );

  const DownloadTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Download Options</h3>
        <p className="text-sm text-muted-foreground">
          Services that allow offline downloading
        </p>
      </div>
      
      <div className="grid gap-4">
        {availableProviders.filter(p => p.hasDownload).map(provider => (
          <Card key={provider.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <img 
                    src={provider.logo} 
                    alt={provider.name}
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{provider.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Download for offline viewing • {provider.quality} quality
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-muted-foreground" />
                  <Button size="sm" variant="outline" asChild>
                    <a href={provider.url} target="_blank" rel="noopener noreferrer">
                      Get App
                      <ExternalLink className="w-3 h-3 ml-2" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!availableProviders.some(p => p.hasDownload) && (
        <div className="text-center py-12">
          <Download className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No download options available for this {contentType} in {selectedRegion}.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            Where to Watch
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="streaming">Streaming</TabsTrigger>
              <TabsTrigger value="download">Download</TabsTrigger>
            </TabsList>

            <TabsContent value="streaming" className="mt-6">
              <StreamingTab />
            </TabsContent>

            <TabsContent value="download" className="mt-6">
              <DownloadTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Availability may vary by region and change over time. 
            Prices and features are subject to change by the streaming providers. 
            We recommend checking the official platforms for the most up-to-date information.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}