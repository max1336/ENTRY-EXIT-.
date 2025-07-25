import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Calendar, User, List, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface EntryRecord {
  id: string;
  type: 'entry' | 'exit';
  timestamp: string;
  person_id: string | null;
  person_name: string | null;
  person_enrollment_no: string | null;
  created_at: string;
}

const EntryList = () => {
  const [entries, setEntries] = useState<EntryRecord[]>([]);
  const [filter, setFilter] = useState<'all' | 'entry' | 'exit'>('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', session.user.id)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setEntries(data);
    } catch (error) {
      console.error('Error loading entries:', error);
      toast({
        title: 'Error',
        description: 'Failed to load entries',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = entries.filter(entry => 
    filter === 'all' || entry.type === filter
  );

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center">Loading entries...</div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <List className="w-5 h-5" />
          Entry/Exit History
        </h2>
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'entry' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('entry')}
          >
            Entries
          </Button>
          <Button
            variant={filter === 'exit' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('exit')}
          >
            Exits
          </Button>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No {filter === 'all' ? '' : filter} records found</p>
          </div>
        ) : (
          filteredEntries.map((entry) => (
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
                  <LogIn className="w-5 h-5 text-entry" />
                ) : (
                  <LogOut className="w-5 h-5 text-exit" />
                )}
                <div>
                  <p className={`font-medium ${
                    entry.type === 'entry' ? 'text-entry' : 'text-exit'
                  }`}>
                    {entry.person_name || 'Anonymous'} - {entry.type === 'entry' ? 'Entry' : 'Exit'}
                  </p>
                  {entry.person_enrollment_no && (
                    <p className="text-sm text-muted-foreground">
                      Enrollment: {entry.person_enrollment_no}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(entry.timestamp), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  {format(new Date(entry.timestamp), 'HH:mm:ss')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(entry.timestamp), 'EEE')}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default EntryList;