import React, { useState, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Loader2, Download, Upload, AlertTriangle, RefreshCw } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export function DataManagement() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Reset mutation
  const resetMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/reset', { method: 'POST' });
    },
    onSuccess: () => {
      // Invalidate all queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      
      toast({
        title: 'Data reset successful',
        description: 'All inventory data has been reset to default',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Reset failed',
        description: error.message || 'An error occurred while resetting data',
        variant: 'destructive',
      });
    },
    onSettled: () => setIsResetting(false),
  });

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/import', { 
        method: 'POST', 
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      // Invalidate all queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });

      toast({
        title: 'Import successful',
        description: 'Your inventory data has been imported',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Import failed',
        description: error.message || 'An error occurred while importing data',
        variant: 'destructive',
      });
    },
    onSettled: () => setIsImporting(false),
  });

  // Categories and items data for export
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
  });

  const { data: items } = useQuery({
    queryKey: ['/api/items'],
  });

  // Handle export functionality
  const handleExport = () => {
    setIsExporting(true);
    try {
      // Create the export data structure
      const exportData = {
        categories: categories || [],
        items: items || [],
        exportDate: new Date().toISOString(),
        version: '1.0',
      };

      // Convert to JSON and create downloadable file
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `inventory_export_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Export successful',
        description: 'Your inventory data has been exported',
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'An error occurred while exporting data',
        variant: 'destructive',
      });
      console.error('Export error:', error);
    }
    setIsExporting(false);
  };

  // State for import confirmation dialog
  const [importConfirmOpen, setImportConfirmOpen] = useState(false);
  const [pendingImportData, setPendingImportData] = useState<any>(null);

  // Handle import file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Validate the import data
        if (!Array.isArray(data.categories) || !Array.isArray(data.items)) {
          throw new Error('Invalid import file format');
        }
        
        // Store the data for confirmation and open the dialog
        setPendingImportData(data);
        setImportConfirmOpen(true);
        
      } catch (error) {
        toast({
          title: 'Import failed',
          description: 'Invalid file format or corrupted data',
          variant: 'destructive',
        });
      }
    };
    reader.onerror = () => {
      toast({
        title: 'Import failed',
        description: 'Error reading the file',
        variant: 'destructive',
      });
    };
    reader.readAsText(file);
    
    // Reset the input so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Confirm and execute import
  const confirmImport = () => {
    if (!pendingImportData) return;
    
    setIsImporting(true);
    importMutation.mutate(pendingImportData);
    setPendingImportData(null);
    setImportConfirmOpen(false);
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Handle reset confirmation
  const handleReset = () => {
    setIsResetting(true);
    resetMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Data Management</h3>
        <p className="text-sm text-muted-foreground">
          Export, import, or reset your inventory data.
        </p>
      </div>
      
      <Separator />
      
      <div className="grid gap-6">
        <div className="space-y-2">
          <Label>Backup Data</Label>
          <p className="text-sm text-muted-foreground">
            Export your inventory data as a JSON file for safekeeping or transferring to another device.
          </p>
          <Button 
            onClick={handleExport} 
            disabled={isExporting}
            className="mt-2"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </>
            )}
          </Button>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <Label>Restore Data</Label>
          <p className="text-sm text-muted-foreground">
            Import previously exported inventory data. This will replace your current data.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Button 
              onClick={triggerFileInput} 
              disabled={isImporting}
            >
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import Data
                </>
              )}
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".json"
              className="hidden"
            />
          </div>
          
          <Alert className="mt-4 bg-amber-50 text-amber-800 border-amber-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Importing data will overwrite your current inventory. Make sure to export your current data first if you want to keep it.
            </AlertDescription>
          </Alert>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <Label>Reset Data</Label>
          <p className="text-sm text-muted-foreground">
            Reset all inventory data. This action cannot be undone.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="mt-2">
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will permanently delete all your inventory data including categories and items. 
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleReset}
                  disabled={isResetting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isResetting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    'Reset All Data'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      {/* Import Confirmation Dialog */}
      <AlertDialog open={importConfirmOpen} onOpenChange={setImportConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Data Import</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace your current inventory data with the imported data. 
              Any existing categories and items not in the import file will be lost.
              
              {pendingImportData && (
                <div className="mt-4 text-sm">
                  <p><strong>Import Summary:</strong></p>
                  <ul className="list-disc pl-5 mt-2">
                    <li>{pendingImportData.categories?.length || 0} categories</li>
                    <li>{pendingImportData.items?.length || 0} items</li>
                    <li>Export version: {pendingImportData.version || 'Unknown'}</li>
                    <li>Export date: {
                      pendingImportData.exportDate 
                        ? new Date(pendingImportData.exportDate).toLocaleString() 
                        : 'Unknown'
                    }</li>
                  </ul>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingImportData(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmImport}
              disabled={isImporting}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                'Confirm Import'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}