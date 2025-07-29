// Google Sheets API integration
const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

interface SheetEntry {
  timestamp: string;
  type: 'entry' | 'exit';
  personName: string;
  personId: string;
  enrollmentNo: string;
  userId: string;
}

interface SheetPerson {
  id: string;
  name: string;
  enrollmentNo: string;
  email: string;
  phone: string;
  qrCodeData: string;
  userId: string;
  createdAt: string;
}

class GoogleSheetsDB {
  private baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';

  // Initialize sheets with headers if they don't exist
  async initializeSheets() {
    try {
      // Check if sheets exist, if not create them
      await this.ensureSheetExists('Entries', [
        'Timestamp', 'Type', 'Person Name', 'Person ID', 'Enrollment No', 'User ID'
      ]);
      
      await this.ensureSheetExists('People', [
        'ID', 'Name', 'Enrollment No', 'Email', 'Phone', 'QR Code Data', 'User ID', 'Created At'
      ]);
    } catch (error) {
      console.error('Error initializing sheets:', error);
    }
  }

  private async ensureSheetExists(sheetName: string, headers: string[]) {
    try {
      // Try to read the sheet first
      const response = await fetch(
        `${this.baseUrl}/${SHEET_ID}/values/${sheetName}!A1:Z1?key=${API_KEY}`
      );
      
      if (!response.ok) {
        // Sheet doesn't exist or is empty, we'll handle this in the app
        console.log(`Sheet ${sheetName} needs to be created manually`);
      }
    } catch (error) {
      console.error(`Error checking sheet ${sheetName}:`, error);
    }
  }

  // Add entry to Entries sheet
  async addEntry(entry: SheetEntry) {
    try {
      const values = [[
        entry.timestamp,
        entry.type,
        entry.personName,
        entry.personId,
        entry.enrollmentNo,
        entry.userId
      ]];

      const response = await fetch(
        `${this.baseUrl}/${SHEET_ID}/values/Entries!A:F:append?valueInputOption=RAW&key=${API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: values
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to add entry to sheet');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding entry:', error);
      throw error;
    }
  }

  // Get all entries for a user
  async getEntries(userId: string): Promise<SheetEntry[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${SHEET_ID}/values/Entries!A:F?key=${API_KEY}`
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      const rows = data.values || [];
      
      // Skip header row and filter by user ID
      return rows.slice(1)
        .filter((row: string[]) => row[5] === userId)
        .map((row: string[]) => ({
          timestamp: row[0] || '',
          type: (row[1] as 'entry' | 'exit') || 'entry',
          personName: row[2] || '',
          personId: row[3] || '',
          enrollmentNo: row[4] || '',
          userId: row[5] || ''
        }));
    } catch (error) {
      console.error('Error getting entries:', error);
      return [];
    }
  }

  // Add person to People sheet
  async addPerson(person: SheetPerson) {
    try {
      const values = [[
        person.id,
        person.name,
        person.enrollmentNo,
        person.email,
        person.phone,
        person.qrCodeData,
        person.userId,
        person.createdAt
      ]];

      const response = await fetch(
        `${this.baseUrl}/${SHEET_ID}/values/People!A:H:append?valueInputOption=RAW&key=${API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: values
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to add person to sheet');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding person:', error);
      throw error;
    }
  }

  // Get all people for a user
  async getPeople(userId: string): Promise<SheetPerson[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${SHEET_ID}/values/People!A:H?key=${API_KEY}`
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      const rows = data.values || [];
      
      // Skip header row and filter by user ID
      return rows.slice(1)
        .filter((row: string[]) => row[6] === userId)
        .map((row: string[]) => ({
          id: row[0] || '',
          name: row[1] || '',
          enrollmentNo: row[2] || '',
          email: row[3] || '',
          phone: row[4] || '',
          qrCodeData: row[5] || '',
          userId: row[6] || '',
          createdAt: row[7] || ''
        }));
    } catch (error) {
      console.error('Error getting people:', error);
      return [];
    }
  }

  // Delete person (this is more complex with Google Sheets, so we'll mark as deleted)
  async deletePerson(personId: string, userId: string) {
    // For simplicity, we'll just not show deleted people in the UI
    // In a real implementation, you'd need to find the row and delete it
    console.log('Delete person functionality would need Google Apps Script for full implementation');
  }

  // Clear all entries for a user
  async clearEntries(userId: string) {
    // This would also need Google Apps Script for full implementation
    console.log('Clear entries functionality would need Google Apps Script for full implementation');
  }
}

export const googleSheetsDB = new GoogleSheetsDB();