import { useState, useEffect } from 'react';
import { UserPlus, QrCode, Camera, Download, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';
import { supabase } from '@/lib/supabase';

export interface Person {
  id: string;
  name: string;
  enrollmentNo?: string;
  email?: string;
  phone?: string;
  qrCodeData?: string;
  createdAt?: Date;
}

interface PersonManagerProps {
  onPersonAdded: (person: Person) => void;
}

const PersonManager = ({ onPersonAdded }: PersonManagerProps) => {
  const [people, setPeople] = useState<Person[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonEmail, setNewPersonEmail] = useState('');
  const [newPersonEnrollment, setNewPersonEnrollment] = useState('');
  const [newPersonPhone, setNewPersonPhone] = useState('');
  const [showQRCodes, setShowQRCodes] = useState<{[key: string]: boolean}>({});
  const [userId, setUserId] = useState<string>('');
  const { toast } = useToast();

  // Load people from Supabase
  useEffect(() => {
    const initializeUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        await loadPeople(session.user.id);
      }
    };

    initializeUser();
  }, []);

  const loadPeople = async (currentUserId: string) => {
    try {
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const peopleData = data.map((person: any) => ({
        id: person.id,
        name: person.name,
        enrollmentNo: person.enrollment_no,
        email: person.email,
        phone: person.phone,
        qrCodeData: person.qr_code_data,
        createdAt: new Date(person.created_at)
      }));

      setPeople(peopleData);
    } catch (error) {
      console.error('Error loading people:', error);
      toast({
        title: 'Error',
        description: 'Failed to load people from database',
        variant: 'destructive',
      });
    }
  };

  const generatePersonId = () => {
    return `person_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const addPerson = async () => {
    if (!newPersonName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name",
        variant: "destructive"
      });
      return;
    }

    try {
      const personId = generatePersonId();
      const personData = {
        id: personId,
        name: newPersonName.trim(),
        enrollmentNo: newPersonEnrollment.trim() || undefined,
        timestamp: new Date().toISOString()
      };

      // Generate QR code containing person data
      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(personData), {
        width: 300,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      });

      // Save to Supabase
      const { data, error } = await supabase
        .from('people')
        .insert({
          id: personId,
          name: newPersonName.trim(),
          enrollment_no: newPersonEnrollment.trim() || null,
          email: newPersonEmail.trim() || null,
          phone: newPersonPhone.trim() || null,
          qr_code_data: qrCodeDataURL,
          user_id: userId
        })
        .select()
        .single();

      if (error) throw error;

      const newPerson: Person = {
        id: data.id,
        name: data.name,
        enrollmentNo: data.enrollment_no,
        email: data.email,
        phone: data.phone,
        qrCodeData: data.qr_code_data,
        createdAt: new Date(data.created_at)
      };

      setPeople(prev => [...prev, newPerson]);
      onPersonAdded(newPerson);
      
      setNewPersonName('');
      setNewPersonEmail('');
      setNewPersonEnrollment('');
      setNewPersonPhone('');
      setIsAddDialogOpen(false);

      toast({
        title: "Person Added",
        description: `${newPerson.name} has been registered successfully`,
      });
    } catch (error) {
      console.error('Error adding person:', error);
      toast({
        title: "Error",
        description: "Failed to add person to database",
        variant: "destructive"
      });
    }
  };

  const deletePerson = async (personId: string) => {
    try {
      const { error } = await supabase
        .from('people')
        .delete()
        .eq('id', personId)
        .eq('user_id', userId);

      if (error) throw error;

      const person = people.find(p => p.id === personId);
      setPeople(prev => prev.filter(p => p.id !== personId));
      toast({
        title: "Person Removed",
        description: `${person?.name} has been removed`,
      });
    } catch (error) {
      console.error('Error deleting person:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete person from database',
        variant: 'destructive',
      });
    }
  };

  const downloadQRCode = (person: Person) => {
    if (person.qrCodeData) {
      const link = document.createElement('a');
      link.download = `${person.name.replace(/\s+/g, '_')}_qr_code.png`;
      link.href = person.qrCodeData;
      link.click();
    }
  };

  const toggleQRCodeVisibility = (personId: string) => {
    setShowQRCodes(prev => ({
      ...prev,
      [personId]: !prev[personId]
    }));
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Registered People</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Person
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Person</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  placeholder="Enter person's name"
                />
              </div>
              <div>
                <Label htmlFor="enrollment">Enrollment No (optional)</Label>
                <Input
                  id="enrollment"
                  value={newPersonEnrollment}
                  onChange={(e) => setNewPersonEnrollment(e.target.value)}
                  placeholder="Enter enrollment number"
                />
              </div>
              <div>
                <Label htmlFor="email">Email (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={newPersonEmail}
                  onChange={(e) => setNewPersonEmail(e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  value={newPersonPhone}
                  onChange={(e) => setNewPersonPhone(e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={addPerson} className="flex-1">
                  <QrCode className="w-4 h-4 mr-2" />
                  Generate QR Code
                </Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {people.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No people registered yet</p>
            <p className="text-sm">Add people to generate their QR codes</p>
          </div>
        ) : (
          people.map((person) => (
            <div key={person.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">{person.name}</h3>
                  {person.enrollmentNo && (
                    <p className="text-sm text-muted-foreground">Enrollment: {person.enrollmentNo}</p>
                  )}
                  {person.email && (
                    <p className="text-sm text-muted-foreground">Email: {person.email}</p>
                  )}
                  {person.phone && (
                    <p className="text-sm text-muted-foreground">Phone: {person.phone}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Added: {person.createdAt?.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleQRCodeVisibility(person.id)}
                  >
                    {showQRCodes[person.id] ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadQRCode(person)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deletePerson(person.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {showQRCodes[person.id] && person.qrCodeData && (
                <div className="flex justify-center pt-3 border-t">
                  <div className="text-center">
                    <img 
                      src={person.qrCodeData} 
                      alt={`QR Code for ${person.name}`}
                      className="mx-auto mb-2 border rounded-lg"
                      style={{ maxWidth: '200px' }}
                    />
                    <p className="text-sm text-muted-foreground">
                      QR Code for {person.name}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default PersonManager;