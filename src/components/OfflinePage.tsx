import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WifiOff, RefreshCw } from "lucide-react";

const OfflinePage = () => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-card">
      <Card className="max-w-md w-full text-center gradient-card border-border shadow-strong">
        <CardContent className="p-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-destructive/10 border border-destructive/20">
              <WifiOff className="h-12 w-12 text-destructive" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold mb-4 gradient-primary bg-clip-text text-transparent">
            No Internet Connection
          </h1>
          
          <p className="text-muted-foreground mb-6 leading-relaxed">
            It looks like you're offline. Please check your internet connection and try again.
          </p>
          
          <div className="space-y-4">
            <Button 
              onClick={handleRetry} 
              disabled={isRetrying}
              className="w-full gradient-primary hover:shadow-glow"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </>
              )}
            </Button>
            
            <div className="text-sm text-muted-foreground">
              <p>Please check:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Your WiFi connection</li>
                <li>Mobile data is enabled</li>
                <li>Airplane mode is disabled</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfflinePage;