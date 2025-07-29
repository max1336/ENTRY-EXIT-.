import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, User, Shield } from 'lucide-react';
import EntryExitTracker from '@/components/EntryExitTracker';
import { googleSheetsDB } from '@/lib/googleSheets';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize Google Sheets
    const initializeApp = async () => {
      try {
        await googleSheetsDB.initializeSheets();
      } catch (error) {
        console.error('Error initializing Google Sheets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  const handleBackToLogin = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p>Initializing Google Sheets connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-lg border-b border-border/50 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Entry Tracker Dashboard
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>Google Sheets Database</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToLogin}
                className="flex items-center gap-2 hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Back to Login
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Card */}
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">Welcome to Entry Tracker</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Manage people registration and track entry/exit activities with QR code scanning.
                All data is automatically saved to your Google Sheets database.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Setup Required:</h4>
                <p className="text-yellow-700 text-sm">
                  Make sure you have configured your Google Sheets API credentials in the .env file. 
                  Check the GOOGLE_SHEETS_SETUP.md file for detailed setup instructions.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Entry Exit Tracker Component */}
          <EntryExitTracker />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;