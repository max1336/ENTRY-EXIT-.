import { useState, useEffect } from 'react';
import { LogIn, LogOut, Clock, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Entry {
  id: string;
  type: 'entry' | 'exit';
  timestamp: Date;
  person?: string;
}

const EntryExitTracker = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [currentCount, setCurrentCount] = useState(0);
  const { toast } = useToast();

  // Load entries from localStorage on component mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('entryExitData');
    if (savedEntries) {
      const parsed = JSON.parse(savedEntries);
      const entriesWithDates = parsed.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }));
      setEntries(entriesWithDates);
      
      // Calculate current count
      const entryCount = entriesWithDates.filter((e: Entry) => e.type === 'entry').length;
      const exitCount = entriesWithDates.filter((e: Entry) => e.type === 'exit').length;
      setCurrentCount(entryCount - exitCount);
    }
  }, []);

  // Save entries to localStorage whenever entries change
  useEffect(() => {
    localStorage.setItem('entryExitData', JSON.stringify(entries));
  }, [entries]);

  const addEntry = (type: 'entry' | 'exit') => {
    const newEntry: Entry = {
      id: Date.now().toString(),
      type,
      timestamp: new Date(),
    };

    setEntries(prev => [newEntry, ...prev]);
    
    if (type === 'entry') {
      setCurrentCount(prev => prev + 1);
      toast({
        title: "Entry Recorded",
        description: `New entry at ${format(new Date(), 'HH:mm:ss')}`,
      });
    } else {
      setCurrentCount(prev => Math.max(0, prev - 1));
      toast({
        title: "Exit Recorded",
        description: `New exit at ${format(new Date(), 'HH:mm:ss')}`,
      });
    }
  };

  const clearAllEntries = () => {
    setEntries([]);
    setCurrentCount(0);
    localStorage.removeItem('entryExitData');
    toast({
      title: "Data Cleared",
      description: "All entry/exit records have been cleared",
    });
  };

  const todayEntries = entries.filter(entry => 
    entry.timestamp.toDateString() === new Date().toDateString()
  );

  const todayEntryCount = todayEntries.filter(e => e.type === 'entry').length;
  const todayExitCount = todayEntries.filter(e => e.type === 'exit').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Entry/Exit Tracker</h1>
          <p className="text-muted-foreground">Monitor entries and exits in real-time</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 bg-card border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Count</p>
                <p className="text-3xl font-bold text-foreground">{currentCount}</p>
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

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => addEntry('entry')}
            variant="entry"
            size="lg"
            className="text-lg px-8 py-6 h-auto"
          >
            <LogIn className="w-6 h-6 mr-2" />
            Record Entry
          </Button>
          
          <Button
            onClick={() => addEntry('exit')}
            variant="exit"
            size="lg"
            className="text-lg px-8 py-6 h-auto"
          >
            <LogOut className="w-6 h-6 mr-2" />
            Record Exit
          </Button>
        </div>

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
                <p className="text-sm">Start tracking by recording an entry or exit</p>
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
                        {entry.type === 'entry' ? 'Entry' : 'Exit'}
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
      </div>
    </div>
  );
};

export default EntryExitTracker;