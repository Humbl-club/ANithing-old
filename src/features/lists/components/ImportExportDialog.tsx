import React, { useState, useCallback, useRef } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, Download, FileText, Database, AlertCircle, CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { useListManagement } from '../hooks/useListManagement';
import type { ListImportData, ListExportData } from '@/types/userLists';

interface ImportExportDialogProps {
  contentType: 'anime' | 'manga' | 'both';
  children: React.ReactNode;
}

interface ImportProgress {
  totalItems: number;
  processedItems: number;
  successCount: number;
  errorCount: number;
  currentItem?: string;
}

export function ImportExportDialog({ contentType, children }: ImportExportDialogProps) {
  const { importList, exportList, isImporting } = useListManagement({ contentType });
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Import state
  const [importSource, setImportSource] = useState<'myanimelist' | 'anilist' | 'kitsu' | 'csv' | 'json'>('myanimelist');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importText, setImportText] = useState('');
  const [importOptions, setImportOptions] = useState({
    mergeDuplicates: true,
    updateExisting: false,
    importRatings: true,
    importProgress: true,
    importDates: true
  });
  
  // Export state
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [isExporting, setIsExporting] = useState(false);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
      
      // Auto-detect format based on file extension
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension === 'json') {
        setImportSource('json');
      } else if (extension === 'csv') {
        setImportSource('csv');
      }
    }
  }, []);

  const parseImportFile = useCallback(async (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          if (importSource === 'json') {
            resolve(JSON.parse(content));
          } else if (importSource === 'csv') {
            // Basic CSV parsing - in production you might want a more robust parser
            const lines = content.split('\n');
            const headers = lines[0].split(',');
            const data = lines.slice(1).map(line => {
              const values = line.split(',');
              const item: any = {};
              headers.forEach((header, index) => {
                item[header.trim()] = values[index]?.trim();
              });
              return item;
            }).filter(item => Object.keys(item).length > 1);
            resolve(data);
          } else {
            resolve(content);
          }
        } catch (error) {
          reject(new Error('Failed to parse file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }, [importSource]);

  const handleImport = useCallback(async () => {
    try {
      let data: any;
      
      if (importFile) {
        data = await parseImportFile(importFile);
      } else if (importText.trim()) {
        try {
          data = JSON.parse(importText);
        } catch {
          // If JSON parsing fails, treat as raw text
          data = importText;
        }
      } else {
        toast.error('Please provide import data');
        return;
      }

      const importData: ListImportData = {
        source_type: importSource,
        data,
        options: {
          merge_duplicates: importOptions.mergeDuplicates,
          update_existing: importOptions.updateExisting,
          import_ratings: importOptions.importRatings,
          import_progress: importOptions.importProgress,
          import_dates: importOptions.importDates
        }
      };

      // Simulate progress updates (in real implementation, this would come from the backend)
      setImportProgress({
        totalItems: Array.isArray(data) ? data.length : 0,
        processedItems: 0,
        successCount: 0,
        errorCount: 0
      });

      const result = await importList(importData);
      
      setImportProgress({
        totalItems: result.total_items || 0,
        processedItems: result.total_items || 0,
        successCount: result.success_count || 0,
        errorCount: result.error_count || 0
      });

      toast.success(`Import completed: ${result.success_count} items imported`);
      if (result.error_count > 0) {
        toast.warning(`${result.error_count} items failed to import`);
      }
      
      // Reset state after successful import
      setTimeout(() => {
        setImportProgress(null);
        setImportFile(null);
        setImportText('');
        setOpen(false);
      }, 3000);
      
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('Failed to import list');
      setImportProgress(null);
    }
  }, [importFile, importText, importSource, importOptions, parseImportFile, importList]);

  const handleExport = useCallback(async () => {
    try {
      setIsExporting(true);
      const exportData = await exportList(exportFormat);
      
      // Create and download file
      const content = exportFormat === 'json' 
        ? JSON.stringify(exportData, null, 2)
        : convertToCSV(exportData.data);
      
      const blob = new Blob([content], {
        type: exportFormat === 'json' ? 'application/json' : 'text/csv'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${contentType}-list-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`List exported as ${exportFormat.toUpperCase()}`);
      
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export list');
    } finally {
      setIsExporting(false);
    }
  }, [exportFormat, exportList, contentType]);

  const convertToCSV = (data: any[]) => {
    if (!Array.isArray(data) || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        }).join(',')
      )
    ].join('\n');
    
    return csvContent;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import & Export Lists</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'import' | 'export')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </TabsTrigger>
            <TabsTrigger value="export">
              <Download className="w-4 h-4 mr-2" />
              Export
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="import" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Import Settings</CardTitle>
                <CardDescription>
                  Import your list from various sources
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="import-source">Source</Label>
                  <Select value={importSource} onValueChange={(value: any) => setImportSource(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select import source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="myanimelist">MyAnimeList</SelectItem>
                      <SelectItem value="anilist">AniList</SelectItem>
                      <SelectItem value="kitsu">Kitsu</SelectItem>
                      <SelectItem value="csv">CSV File</SelectItem>
                      <SelectItem value="json">JSON File</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="import-file">Import File</Label>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept={importSource === 'json' ? '.json' : importSource === 'csv' ? '.csv' : '.json,.csv'}
                    onChange={handleFileSelect}
                    className="mt-1"
                  />
                  {importFile && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Selected: {importFile.name}
                    </p>
                  )}
                </div>
                
                <div className="text-center text-muted-foreground">or</div>
                
                <div>
                  <Label htmlFor="import-text">Paste Data</Label>
                  <Textarea
                    id="import-text"
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder="Paste your list data here (JSON format)"
                    rows={6}
                    className="mt-1"
                  />
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Import Options</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="merge-duplicates">Merge duplicates</Label>
                      <Switch
                        id="merge-duplicates"
                        checked={importOptions.mergeDuplicates}
                        onCheckedChange={(checked) => 
                          setImportOptions(prev => ({ ...prev, mergeDuplicates: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="update-existing">Update existing entries</Label>
                      <Switch
                        id="update-existing"
                        checked={importOptions.updateExisting}
                        onCheckedChange={(checked) => 
                          setImportOptions(prev => ({ ...prev, updateExisting: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="import-ratings">Import ratings</Label>
                      <Switch
                        id="import-ratings"
                        checked={importOptions.importRatings}
                        onCheckedChange={(checked) => 
                          setImportOptions(prev => ({ ...prev, importRatings: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="import-progress">Import progress</Label>
                      <Switch
                        id="import-progress"
                        checked={importOptions.importProgress}
                        onCheckedChange={(checked) => 
                          setImportOptions(prev => ({ ...prev, importProgress: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="import-dates">Import dates</Label>
                      <Switch
                        id="import-dates"
                        checked={importOptions.importDates}
                        onCheckedChange={(checked) => 
                          setImportOptions(prev => ({ ...prev, importDates: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {importProgress && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Import Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress 
                    value={importProgress.totalItems > 0 ? (importProgress.processedItems / importProgress.totalItems) * 100 : 0} 
                  />
                  <div className="flex justify-between text-sm">
                    <span>{importProgress.processedItems} / {importProgress.totalItems} processed</span>
                    <span>{Math.round((importProgress.processedItems / importProgress.totalItems) * 100)}%</span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{importProgress.successCount} successful</span>
                    </div>
                    {importProgress.errorCount > 0 && (
                      <div className="flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span>{importProgress.errorCount} failed</span>
                      </div>
                    )}
                  </div>
                  {importProgress.currentItem && (
                    <p className="text-sm text-muted-foreground">
                      Processing: {importProgress.currentItem}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="export" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Export Settings</CardTitle>
                <CardDescription>
                  Export your list in various formats
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="export-format">Export Format</Label>
                  <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select export format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          JSON (Complete data)
                        </div>
                      </SelectItem>
                      <SelectItem value="csv">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          CSV (Spreadsheet compatible)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Export Preview</h4>
                  <p className="text-sm text-muted-foreground">
                    {exportFormat === 'json' 
                      ? 'Your list will be exported as a JSON file containing all data including ratings, progress, notes, and metadata.'
                      : 'Your list will be exported as a CSV file compatible with Excel and other spreadsheet applications. Some metadata may be simplified.'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          {activeTab === 'import' ? (
            <Button 
              onClick={handleImport} 
              disabled={isImporting || (!importFile && !importText.trim())}
            >
              {isImporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import List
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export List
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}