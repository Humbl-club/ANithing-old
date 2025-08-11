import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface RangeFiltersProps {
  scoreRange: [number, number];
  yearRange: [number, number];
  onScoreChange: (range: [number, number]) => void;
  onYearChange: (range: [number, number]) => void;
}

export function RangeFilters({ scoreRange, yearRange, onScoreChange, onYearChange }: RangeFiltersProps) {
  const currentYear = new Date().getFullYear();
  
  const resetFilters = () => {
    onScoreChange([0, 10]);
    onYearChange([1960, currentYear]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Rating & Year Filters</Label>
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </Button>
      </div>

      {/* Score Range */}
      <div className="space-y-3">
        <Label className="text-sm">Score Range</Label>
        <div className="px-2">
          <Slider
            value={scoreRange}
            onValueChange={(value) => onScoreChange(value as [number, number])}
            max={10}
            min={0}
            step={0.1}
            className="w-full"
          />
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{scoreRange[0].toFixed(1)}</span>
          <span>{scoreRange[1].toFixed(1)}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            placeholder="Min"
            value={scoreRange[0]}
            onChange={(e) => {
              const value = Math.max(0, Math.min(10, parseFloat(e.target.value) || 0));
              onScoreChange([value, scoreRange[1]]);
            }}
            className="w-20"
            min={0}
            max={10}
            step={0.1}
          />
          <span>to</span>
          <Input
            type="number" 
            placeholder="Max"
            value={scoreRange[1]}
            onChange={(e) => {
              const value = Math.max(0, Math.min(10, parseFloat(e.target.value) || 10));
              onScoreChange([scoreRange[0], value]);
            }}
            className="w-20"
            min={0}
            max={10}
            step={0.1}
          />
        </div>
      </div>

      {/* Year Range */}
      <div className="space-y-3">
        <Label className="text-sm">Year Range</Label>
        <div className="px-2">
          <Slider
            value={yearRange}
            onValueChange={(value) => onYearChange(value as [number, number])}
            max={currentYear}
            min={1960}
            step={1}
            className="w-full"
          />
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{yearRange[0]}</span>
          <span>{yearRange[1]}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            placeholder="From"
            value={yearRange[0]}
            onChange={(e) => {
              const value = Math.max(1960, Math.min(currentYear, parseInt(e.target.value) || 1960));
              onYearChange([value, yearRange[1]]);
            }}
            className="w-24"
            min={1960}
            max={currentYear}
          />
          <span>to</span>
          <Input
            type="number"
            placeholder="To"
            value={yearRange[1]}
            onChange={(e) => {
              const value = Math.max(1960, Math.min(currentYear, parseInt(e.target.value) || currentYear));
              onYearChange([yearRange[0], value]);
            }}
            className="w-24"
            min={1960}
            max={currentYear}
          />
        </div>
      </div>
    </div>
  );
}