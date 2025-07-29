import { useState, useEffect } from 'react';
import { LogIn, LogOut, Clock, Users, TrendingUp, Scan, QrCode, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import PersonManager, { Person } from './PersonManager';
import QRCodeScanner from './QRCodeScanner';
import { googleSheetsDB } from '@/lib/googleSheets';

interface Entry {
  id: string;
  type: 'entry' | 'exit';
  timestamp: Date;
  person?: {
    id: string;
    name: string;
    enrollmentNo?: string;
  };
}

const EntryExitTracker = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [currentCount, setCurrentCount] = useState(0);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [currentPersonInside, setCurrentPersonInside] = useState<Set<string>>(new Set());
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [isManualExitOpen, setIsManualExitOpen] = useState(false);
  const [manualEntryForm, setManualEntryForm] = useState({ name: '', enrollmentNo: '' });
  const [isAllEntriesOpen, setIsAllEntriesOpen] = useState(false);
  const [userId] = useState('default_user'); // Simple user ID for Google Sheets
  const { toast } = useToast();

  // Load entries from Google Sheets on component mount
  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const sheetEntries = await googleSheetsDB.getEntries(userId);
      
      const entriesWithDates = sheetEntries.map((entry) => ({
        id: `${entry.timestamp}_${entry.personId}`,
        type: entry.type,
        timestamp: new Date(entry.timestamp),
        person: entry.personId ? {
          id: entry.personId,
          name: entry.personName,
          enrollmentNo: entry.enrollmentNo
        } : undefined
      }));

      // Sort by timestamp descending
      entriesWithDates.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      setEntries(entriesWithDates);
      
      // Calculate current count and who's inside
      const peopleInside = new Set<string>();
      let count = 0;
      
      // Process entries chronologically to track who's currently inside
      const sortedEntries = [...entriesWithDates].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      for (const entry of sortedEntries) {
        if (entry.person?.id) {
          if (entry.type === 'entry') {
            peopleInside.add(entry.person.id);
          } else {
            peopleInside.delete(entry.person.id);
          }
        } else {
          // Handle anonymous entries
          if (entry.type === 'entry') count++;
          else count--;
        }
      }
      
      setCurrentPersonInside(peopleInside);
      setCurrentCount(peopleInside.size + Math.max(0, count));
    } catch (error) {
      console.error('Error loading entries:', error);
      toast({
        title: 'Error',
        description: 'Failed to load entries from Google Sheets',
        variant: 'destructive',
      });
    }
  };

  // Save entries to Google Sheets
  const saveEntryToDatabase = async (entry: Entry) => {
    try {
      await googleSheetsDB.addEntry({
        timestamp: entry.timestamp.toISOString(),
        type: entry.type,
        personName: entry.person?.name || '',
        personId: entry.person?.id || '',
        enrollmentNo: entry.person?.enrollmentNo || '',
        userId: userId
      });
    } catch (error) {
      console.error('Error saving entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to save entry to Google Sheets',
        variant: 'destructive',
      });
    }
  };

  const addEntry = async (type: 'entry' | 'exit', person?: { id: string; name: string; enrollmentNo?: string }) => {
    const newEntry: Entry = {
      id: Date.now().toString(),
      type,
      timestamp: new Date(),
      person
    };

    setEntries(prev => [newEntry, ...prev]);
    
    // Save to database
    await saveEntryToDatabase(newEntry);
    
    // Update current person tracking
    if (person) {
      if (type === 'entry') {
        setCurrentPersonInside(prev => new Set([...prev, person.id]));
        setCurrentCount(prev => prev + 1);
        toast({
          title: "Entry Recorded",
          description: `${person.name} entered at ${format(new Date(), 'HH:mm:ss')}`,
        });
      } else {
        setCurrentPersonInside(prev => {
          const newSet = new Set(prev);
          newSet.delete(person.id);
          return newSet;
        });
        setCurrentCount(prev => Math.max(0, prev - 1));
        toast({
          title: "Exit Recorded", 
          description: `${person.name} exited at ${format(new Date(), 'HH:mm:ss')}`,
        });
      }
    } else {
      // Anonymous entry/exit
      if (type === 'entry') {
        setCurrentCount(prev => prev + 1);
        toast({
          title: "Entry Recorded",
          description: `Anonymous entry at ${format(new Date(), 'HH:mm:ss')}`,
        });
      } else {
        setCurrentCount(prev => Math.max(0, prev - 1));
        toast({
          title: "Exit Recorded",
          description: `Anonymous exit at ${format(new Date(), 'HH:mm:ss')}`,
        });
      }
    }
  };

  const handleQRScanSuccess = (personData: any) => {
    const person = { id: personData.id, name: personData.name };
    
    // Use the type selected by the user in the QR scanner dialog
    const actionType = personData.type || 'entry';
    
    addEntry(actionType, person);
  };

  const handleManualEntry = (type: 'entry' | 'exit') => {
    const person = manualEntryForm.name.trim() 
      ? { 
          id: `manual_${Date.now()}`, 
          name: manualEntryForm.name.trim(),
          enrollmentNo: manualEntryForm.enrollmentNo.trim() || undefined
        }
      : undefined;
    
    addEntry(type, person);
    setManualEntryForm({ name: '', enrollmentNo: '' });
    setIsManualEntryOpen(false);
    setIsManualExitOpen(false);
  };

  const clearAllEntries = async () => {
    try {
      // Note: This would need Google Apps Script for full implementation
      // For now, we'll just clear the local state
      setEntries([]);
      setCurrentCount(0);
      setCurrentPersonInside(new Set());
      toast({
        title: "Data Cleared",
        description: "All entry/exit records have been cleared locally",
      });
    } catch (error) {
      console.error('Error clearing entries:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear entries',
        variant: 'destructive',
      });
    }
  };

  const todayEntries = entries.filter(entry => 
    entry.timestamp.toDateString() === new Date().toDateString()
  );

  const todayEntryCount = todayEntries.filter(e => e.type === 'entry').length;
  const todayExitCount = todayEntries.filter(e => e.type === 'exit').length;
  const todayNetCount = todayEntryCount - todayExitCount;

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Entry/Exit Tracker</h1>
          <p className="text-muted-foreground">Monitor entries and exits with QR codes - Data saved to Google Sheets</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 bg-card border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Net Count</p>
                <p className="text-3xl font-bold text-foreground">{todayNetCount}</p>
              </div>
              <Users className="h-8 w-8 text-neutral" />
            </div>
          </Card>

          <Card className="p-6 bg-entry-muted border border-entry/20 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-entry">Today's Entries</p>
                <p className="text-3xl font-bold text-entry">{todayEntryCount}</p>
              </div>
              <LogIn className="h-8 w-8 text-entry" />
            </div>
          </Card>

          <Card className="p-6 bg-exit-muted border border-exit/20 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-exit">Today's Exits</p>
                <p className="text-3xl font-bold text-exit">{todayExitCount}</p>
              </div>
              <LogOut className="h-8 w-8 text-exit" />
            </div>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="scanner" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="scanner">QR Scanner</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="people">Manage People</TabsTrigger>
            <TabsTrigger value="entries">All Entries</TabsTrigger>
          </TabsList>

          <TabsContent value="scanner" className="space-y-4">
            <Card className="p-6">
              <div className="text-center space-y-4">
                <div>
                  <Scan className="w-16 h-16 mx-auto text-primary mb-4" />
                  <h2 className="text-2xl font-semibold text-foreground mb-2">QR Code Scanner</h2>
                  <p className="text-muted-foreground">
                    Scan a person's QR code to automatically record their entry or exit
                  </p>
                </div>
                
                <Button
                  onClick={() => setIsQRScannerOpen(true)}
                  size="lg"
                  className="text-lg px-8 py-6 h-auto"
                >
                  <Scan className="w-6 h-6 mr-2" />
                  Start Scanning
                </Button>
                
                <div className="text-sm text-muted-foreground">
                  <p>The system automatically detects if a person is entering or exiting</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Manual Entry/Exit</h2>
              <p className="text-muted-foreground mb-6">
                Record entries and exits with optional person details
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Dialog open={isManualEntryOpen} onOpenChange={setIsManualEntryOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="entry"
                      size="lg"
                      className="text-lg px-8 py-6 h-auto"
                    >
                      <LogIn className="w-6 h-6 mr-2" />
                      Record Entry
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Record Entry</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="entry-name">Name</Label>
                        <Input
                          id="entry-name"
                          placeholder="Enter person's name (optional)"
                          value={manualEntryForm.name}
                          onChange={(e) => setManualEntryForm(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="entry-enrollment">Enrollment No</Label>
                        <Input
                          id="entry-enrollment"
                          placeholder="Enter enrollment number (optional)"
                          value={manualEntryForm.enrollmentNo}
                          onChange={(e) => setManualEntryForm(prev => ({ ...prev, enrollmentNo: e.target.value }))}
                        />
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={() => handleManualEntry('entry')}
                          variant="entry"
                          className="flex-1"
                        >
                          <LogIn className="w-4 h-4 mr-2" />
                          Record Entry
                        </Button>
                        <Button
                          onClick={() => setIsManualEntryOpen(false)}
                          variant="outline"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Dialog open={isManualExitOpen} onOpenChange={setIsManualExitOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="exit"
                      size="lg"
                      className="text-lg px-8 py-6 h-auto"
                    >
                      <LogOut className="w-6 h-6 mr-2" />
                      Record Exit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Record Exit</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="exit-name">Name</Label>
                        <Input
                          id="exit-name"
                          placeholder="Enter person's name (optional)"
                          value={manualEntryForm.name}
                          onChange={(e) => setManualEntryForm(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="exit-enrollment">Enrollment No</Label>
                        <Input
                          id="exit-enrollment"
                          placeholder="Enter enrollment number (optional)"
                          value={manualEntryForm.enrollmentNo}
                          onChange={(e) => setManualEntryForm(prev => ({ ...prev, enrollmentNo: e.target.value }))}
                        />
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={() => handleManualEntry('exit')}
                          variant="exit"
                          className="flex-1"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Record Exit
                        </Button>
                        <Button
                          onClick={() => setIsManualExitOpen(false)}
                          variant="outline"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="people" className="space-y-4">
            <PersonManager onPersonAdded={(person) => {
              toast({
                title: "Person Added",
                description: `${person.name} can now use their QR code for entry/exit`,
              });
            }} />
          </TabsContent>

          <TabsContent value="entries" className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <List className="w-5 h-5" />
                  All Entries & Exits
                </h2>
                {entries.length > 0 && (
                  <Button
                    onClick={clearAllEntries}
                    variant="outline"
                    size="sm"
                  >
                    Clear All
                  </Button>
                )}
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {entries.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No entries recorded yet</p>
                    <p className="text-sm">Start tracking by scanning QR codes or manual entry</p>
                  </div>
                ) : (
                  entries.map((entry) => (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        entry.type === 'entry'
                          ? 'bg-entry-muted border-entry/20'
                          : 'bg-exit-muted border-exit/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {entry.type === 'entry' ? (
                          <LogIn className={`w-5 h-5 text-entry`} />
                        ) : (
                          <LogOut className={`w-5 h-5 text-exit`} />
                        )}
                        <div>
                          <p className={`font-medium ${
                            entry.type === 'entry' ? 'text-entry' : 'text-exit'
                          }`}>
                            {entry.person ? entry.person.name : 'Anonymous'} - {entry.type === 'entry' ? 'Entry' : 'Exit'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(entry.timestamp, 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {format(entry.timestamp, 'HH:mm:ss')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(entry.timestamp, 'EEE')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recent Entries */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activity
            </h2>
            {entries.length > 0 && (
              <Button
                onClick={clearAllEntries}
                variant="outline"
                size="sm"
              >
                Clear All
              </Button>
            )}
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {entries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No entries recorded yet</p>
                <p className="text-sm">Start tracking by scanning QR codes or manual entry</p>
              </div>
            ) : (
              entries.slice(0, 20).map((entry) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    entry.type === 'entry'
                      ? 'bg-entry-muted border-entry/20'
                      : 'bg-exit-muted border-exit/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {entry.type === 'entry' ? (
                      <LogIn className={`w-5 h-5 text-entry`} />
                    ) : (
                      <LogOut className={`w-5 h-5 text-exit`} />
                    )}
                    <div>
                      <p className={`font-medium ${
                        entry.type === 'entry' ? 'text-entry' : 'text-exit'
                      }`}>
                        {entry.person ? entry.person.name : 'Anonymous'} - {entry.type === 'entry' ? 'Entry' : 'Exit'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(entry.timestamp, 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {format(entry.timestamp, 'HH:mm:ss')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(entry.timestamp, 'EEE')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* QR Scanner Modal */}
        <QRCodeScanner 
          isOpen={isQRScannerOpen}
          onClose={() => setIsQRScannerOpen(false)}
          onScanSuccess={handleQRScanSuccess}
        />
    </div>
  );
};

export default EntryExitTracker;