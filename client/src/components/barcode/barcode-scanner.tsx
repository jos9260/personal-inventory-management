import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, Result, BarcodeFormat } from '@zxing/library';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Camera, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (result: string) => void;
}

const formatsToUse = [
  BarcodeFormat.QR_CODE,
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
  BarcodeFormat.CODE_128,
  BarcodeFormat.CODE_39,
  BarcodeFormat.CODE_93,
];

export default function BarcodeScanner({ isOpen, onClose, onScanSuccess }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  
  // Initialize barcode reader when modal opens
  useEffect(() => {
    if (isOpen) {
      initializeReader();
    }
    
    return () => {
      if (codeReaderRef.current) {
        try {
          codeReaderRef.current.reset();
        } catch (error) {
          console.error('Error resetting code reader:', error);
        }
      }
    };
  }, [isOpen]);
  
  // Initialize the reader and setup camera
  const initializeReader = async () => {
    setError(null);
    setScanning(true);
    
    if (!codeReaderRef.current) {
      const hints = new Map();
      hints.set(2, formatsToUse);
      
      const reader = new BrowserMultiFormatReader(hints);
      codeReaderRef.current = reader;
    }
    
    try {
      // Check if cameras are available
      const devices = await codeReaderRef.current.listVideoInputDevices();
      setHasCamera(devices.length > 0);
      
      if (devices.length === 0) {
        setError('No camera found on this device');
        setScanning(false);
        return;
      }
      
      // Get video element
      const videoElement = videoRef.current;
      if (!videoElement) {
        setError('Could not find video element');
        setScanning(false);
        return;
      }
      
      // Start decoding from first available camera
      codeReaderRef.current.decodeFromVideoDevice(
        devices[0]?.deviceId || "", // Use first camera or empty string
        videoElement,
        (result: Result | null, error?: any) => {
          if (result) {
            handleScanSuccess(result.getText());
          }
          if (error && !(error instanceof Exception)) {
            console.error('Barcode scanning error:', error);
          }
        }
      );
    } catch (error) {
      console.error('Error initializing barcode reader:', error);
      setError('Could not access camera. Please check camera permissions.');
      setScanning(false);
    }
  };
  
  // Handle successful scan
  const handleScanSuccess = (text: string) => {
    if (codeReaderRef.current) {
      try {
        codeReaderRef.current.reset();
      } catch (error) {
        console.error('Error resetting code reader:', error);
      }
    }
    
    onScanSuccess(text);
    onClose();
  };
  
  // Handle manual scan stop
  const handleStopScanning = () => {
    if (codeReaderRef.current) {
      try {
        codeReaderRef.current.reset();
      } catch (error) {
        console.error('Error resetting code reader:', error);
      }
    }
    
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Scan Barcode or QR Code</DialogTitle>
          <DialogDescription>
            Position the code in the center of the camera view
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center">
          {error ? (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : hasCamera === false ? (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Camera Found</AlertTitle>
              <AlertDescription>Please use a device with a camera to scan barcodes.</AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="relative w-full bg-black rounded-md overflow-hidden aspect-square mb-4">
                {scanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                )}
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                ></video>
                
                {/* Scanning guide overlay */}
                <div className="absolute inset-0 border-2 border-dashed border-primary/70 m-8 pointer-events-none"></div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4 text-center">
                Make sure the barcode is well-lit and centered in the frame
              </p>
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2" 
            onClick={handleStopScanning}
          >
            <Camera className="h-4 w-4" />
            {hasCamera === null || scanning ? "Cancel Scanning" : "Try Again"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Create a class for Exception for proper error handling
class Exception extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'Exception';
  }
}