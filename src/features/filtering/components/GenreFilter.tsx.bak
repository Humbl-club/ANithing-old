import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, X } from 'lucide-react';

interface GenreFilterProps {
  availableGenres: string[];
  selectedGenres: string[];
  onGenreChange: (genres: string[]) => void;
}

export function GenreFilter({ availableGenres, selectedGenres, onGenreChange }: GenreFilterProps) {
  const [genreSearch, setGenreSearch] = useState('');
  
  const filteredGenres = availableGenres.filter(genre =>
    genre.toLowerCase().includes(genreSearch.toLowerCase())
  );

  const handleGenreToggle = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      onGenreChange(selectedGenres.filter(g => g !== genre));
    } else {
      onGenreChange([...selectedGenres, genre]);
    }
  };

  const clearGenres = () => {
    onGenreChange([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Genres</Label>
        {selectedGenres.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearGenres}>
            <X className="w-4 h-4 mr-1" />
            Clear ({selectedGenres.length})
          </Button>
        )}
      </div>

      {/* Genre Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search genres..."
          value={genreSearch}
          onChange={(e) => setGenreSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Selected Genres */}
      {selectedGenres.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Selected:</Label>
          <div className="flex flex-wrap gap-2">
            {selectedGenres.map(genre => (
              <Badge 
                key={genre} 
                variant="default" 
                className="cursor-pointer hover:bg-destructive"
                onClick={() => handleGenreToggle(genre)}
              >
                {genre}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Genre List */}
      <div className="max-h-48 overflow-y-auto space-y-2 border rounded-md p-3">
        {filteredGenres.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No genres found matching "{genreSearch}"
          </p>
        ) : (
          filteredGenres.map(genre => (
            <div key={genre} className="flex items-center space-x-2">
              <Checkbox
                id={genre}
                checked={selectedGenres.includes(genre)}
                onCheckedChange={() => handleGenreToggle(genre)}
              />
              <Label
                htmlFor={genre}
                className="text-sm font-normal cursor-pointer flex-1"
              >
                {genre}
              </Label>
            </div>
          ))
        )}
      </div>
    </div>
  );
}