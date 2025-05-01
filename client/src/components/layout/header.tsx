import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/search-bar";
import { Link } from "wouter";
import { Plus, Settings, Scan, Menu, X } from "lucide-react";
import BarcodeScanner from "@/components/barcode/barcode-scanner";

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAddItem: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function Header({ 
  searchQuery, 
  setSearchQuery, 
  onAddItem,
  onToggleSidebar,
  isSidebarOpen
}: HeaderProps) {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  
  const handleScanSuccess = (barcodeData: string) => {
    // Search for the barcode when scan is successful
    setSearchQuery(barcodeData);
  };
  
  return (
    <header className="bg-white shadow-sm dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="flex md:hidden"
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
          
          <Link href="/" className="flex-shrink-0 flex items-center cursor-pointer">
              <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="8" height="8" rx="1" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
                <rect x="13" y="3" width="8" height="8" rx="1" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
                <rect x="3" y="13" width="8" height="8" rx="1" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
                <rect x="13" y="13" width="8" height="8" rx="1" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
              </svg>
              <span className="ml-2 text-xl font-semibold">Inventory Hub</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-2 flex-1 mx-4">
          <SearchBar 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
          />
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsScannerOpen(true)}
            title="Scan Barcode"
            className="hidden sm:flex"
          >
            <Scan className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Link href="/settings">
            <Button 
              variant="outline"
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden md:inline">Settings</span>
            </Button>
          </Link>
          
          <Button 
            onClick={onAddItem}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Item</span>
          </Button>
        </div>
      </div>
      
      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </header>
  );
}
