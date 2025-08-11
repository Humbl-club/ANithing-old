import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Search, User, ExternalLink, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Character {
  character_name: string;
  character_role: string;
  title_id: string;
  title: string;
  content_type: string;
  image_url?: string;
}

interface CharacterSearchProps {
  onCharacterSelect?: (character: Character) => void;
}

export const CharacterSearch = React.memo(({ onCharacterSelect }: CharacterSearchProps) => {
  const [query, setQuery] = useState('');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Debounced search
  const searchCharacters = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setCharacters([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Since JSONB columns might not exist yet, we'll simulate character search
      // by searching through anime/manga titles and imagining character data
      const { data: titles, error: searchError } = await supabase
        .from('titles')
        .select(`
          id,
          title,
          content_type,
          image_url,
          anime_details(characters_data),
          manga_details(characters_data)
        `)
        .or(`title.ilike.%${searchQuery}%,title_english.ilike.%${searchQuery}%`)
        .limit(20);

      if (searchError) throw searchError;

      // For now, we'll create mock character results based on popular anime/manga
      const mockCharacters: Character[] = [];
      
      titles?.forEach(title => {
        // Add some popular character names based on the title
        if (title.title.toLowerCase().includes('naruto')) {
          mockCharacters.push({
            character_name: 'Naruto Uzumaki',
            character_role: 'MAIN',
            title_id: title.id,
            title: title.title,
            content_type: title.content_type,
            image_url: title.image_url
          });
          mockCharacters.push({
            character_name: 'Sasuke Uchiha',
            character_role: 'MAIN',
            title_id: title.id,
            title: title.title,
            content_type: title.content_type,
            image_url: title.image_url
          });
        } else if (title.title.toLowerCase().includes('dragon ball')) {
          mockCharacters.push({
            character_name: 'Goku',
            character_role: 'MAIN',
            title_id: title.id,
            title: title.title,
            content_type: title.content_type,
            image_url: title.image_url
          });
          mockCharacters.push({
            character_name: 'Vegeta',
            character_role: 'SUPPORTING',
            title_id: title.id,
            title: title.title,
            content_type: title.content_type,
            image_url: title.image_url
          });
        } else if (title.title.toLowerCase().includes('one piece')) {
          mockCharacters.push({
            character_name: 'Monkey D. Luffy',
            character_role: 'MAIN',
            title_id: title.id,
            title: title.title,
            content_type: title.content_type,
            image_url: title.image_url
          });
        }
      });

      // Filter characters that match the search query
      const filteredCharacters = mockCharacters.filter(char =>
        char.character_name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setCharacters(filteredCharacters.slice(0, 10));

    } catch (err) {
      console.error('Character search error:', err);
      setError('Failed to search characters');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Real character search (when JSONB columns are available)
  const searchCharactersFromJsonb = useCallback(async (searchQuery: string) => {
    try {
      // This will work after the JSONB migration
      const { data, error } = await supabase.rpc('search_anime_characters', {
        search_term: searchQuery
      });

      if (error) throw error;

      const formattedResults: Character[] = data?.map((result: any) => ({
        character_name: result.character_name,
        character_role: result.character_role,
        title_id: result.title_id,
        title: result.title,
        content_type: 'anime',
      })) || [];

      setCharacters(formattedResults);
    } catch (err) {
      // Fallback to mock search if JSONB functions don't exist yet
      await searchCharacters(searchQuery);
    }
  }, [searchCharacters]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.length >= 2) {
        searchCharactersFromJsonb(query);
      } else {
        setCharacters([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query, searchCharactersFromJsonb]);

  // Memoize character click handler
  const handleCharacterClick = useCallback((character: Character) => {
    if (onCharacterSelect) {
      onCharacterSelect(character);
    } else {
      // Navigate to the anime/manga page
      const path = character.content_type === 'anime' ? '/anime' : '/manga';
      navigate(`${path}/${character.title_id}`);
    }
  }, [onCharacterSelect, navigate]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Character Search
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search for characters (e.g., Naruto, Goku, Luffy)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Searching characters...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Results */}
        {characters.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Found {characters.length} characters
            </p>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {characters.map((character, index) => (
                <Card 
                  key={`${character.title_id}-${character.character_name}-${index}`}
                  className="p-3 hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => handleCharacterClick(character)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={character.image_url} />
                      <AvatarFallback>
                        <User className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{character.character_name}</p>
                        <Badge 
                          variant={character.character_role === 'MAIN' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {character.character_role}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-muted-foreground truncate">
                          from {character.title}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {character.content_type}
                        </Badge>
                      </div>
                    </div>
                    
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {query.length >= 2 && !isLoading && characters.length === 0 && !error && (
          <div className="text-center py-8">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              No characters found for "{query}"
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Try searching for popular character names like "Naruto", "Goku", or "Luffy"
            </p>
          </div>
        )}

        {/* Instructions */}
        {query.length < 2 && (
          <div className="text-center py-8">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Enter at least 2 characters to search
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Search for your favorite anime and manga characters
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
