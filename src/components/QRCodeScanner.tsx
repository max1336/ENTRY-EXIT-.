import { useState, useRef, useEffect } from 'react';
import { Camera, X, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import QrScanner from 'qr-scanner';

interface QRScannerProps {
  onScanSuccess: (personData: any) => void;
  isOpen: boolean;
  onClose: () => void;
}

const QRCodeScanner = ({ onScanSuccess, isOpen, onClose }: QRScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && videoRef.current) {
      startScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = async () => {
    try {
      if (!videoRef.current) return;

      // Check if camera is available
      const hasCamera = await QrScanner.hasCamera();
      if (!hasCamera) {
        setHasCamera(false);
        toast({
          title: "No Camera",
          description: "No camera found on this device",
          variant: "destructive"
        });
        return;
      }

      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          try {
            // Try to parse the QR code data as JSON
            const personData = JSON.parse(result.data);
            
            // Validate that it contains the expected structure
            if (personData.id && personData.name) {
              onScanSuccess(personData);
              stopScanner();
              onClose();
              toast({
                title: "QR Code Scanned",
                description: `Detected: ${personData.name}`,
              });
            } else {
              toast({
                title: "Invalid QR Code",
                description: "This QR code is not a valid person code",
                variant: "destructive"
              });
            }
          } catch (error) {
            toast({
              title: "Invalid QR Code",
              description: "Unable to read person data from QR code",
              variant: "destructive"
            });
          }
        },
        {
          preferredCamera: 'environment', // Use back camera if available
          highlightScanRegion: true,
          highlightCodeOutline: true,
          maxScansPerSecond: 5,
        }
      );

      scannerRef.current = scanner;
      await scanner.start();
      setIsScanning(true);
      setHasCamera(true);

    } catch (error) {
      console.error('Scanner error:', error);
      setHasCamera(false);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scan className="w-5 h-5" />
            Scan QR Code
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {hasCamera ? (
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 bg-black rounded-lg object-cover"
                playsInline
                muted
              />
              
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-primary w-48 h-48 rounded-lg border-dashed animate-pulse" />
                </div>
              )}
              
              {!isScanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                  <div className="text-center text-white">
                    <Camera className="w-12 h-12 mx-auto mb-2" />
                    <p>Initializing camera...</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-muted rounded-lg">
              <Camera className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-center text-muted-foreground">
                Camera not available
              </p>
              <p className="text-sm text-center text-muted-foreground mt-2">
                Please check camera permissions or try a different device
              </p>
            </div>
          )}
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Position the QR code within the scanning area
            </p>
            <Button variant="outline" onClick={handleClose} className="w-full">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeScanner;