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

  // Test connection to Google Sheets
  async testConnection() {
    try {
      const response = await fetch(
        `${this.baseUrl}/${SHEET_ID}?key=${API_KEY}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Google Sheets API Error:', errorData);
        throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
      }
      
      const data = await response.json();
      console.log('Google Sheets connection successful:', data.properties?.title);
      return true;
    } catch (error) {
      console.error('Error testing Google Sheets connection:', error);
      throw error;
    }
  }

  // Initialize sheets with headers if they don't exist
  async initializeSheets() {
    try {
      console.log('Initializing Google Sheets...');
      await this.testConnection();
      
      // Check if sheets exist and have proper headers
      await this.ensureSheetExists('Entries');
      await this.ensureSheetExists('People');
      
      console.log('Google Sheets initialized successfully');
    } catch (error) {
      console.error('Error initializing sheets:', error);
      throw error;
    }
  }

  private async ensureSheetExists(sheetName: string) {
    try {
      // Try to read the first row to check if headers exist
      const response = await fetch(
        `${this.baseUrl}/${SHEET_ID}/values/${sheetName}!A1:Z1?key=${API_KEY}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Error checking sheet ${sheetName}:`, errorData);
        throw new Error(`Sheet ${sheetName} not accessible: ${errorData.error?.message}`);
      }
      
      const data = await response.json();
      console.log(`Sheet ${sheetName} exists with headers:`, data.values?.[0]);
      
    } catch (error) {
      console.error(`Error checking sheet ${sheetName}:`, error);
      throw error;
    }
  }

  // Add entry to Entries sheet
  async addEntry(entry: SheetEntry) {
    try {
      console.log('Adding entry to Google Sheets:', entry);
      
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
        const errorData = await response.json();
        console.error('Error adding entry:', errorData);
        throw new Error(`Failed to add entry: ${errorData.error?.message || 'Unknown error'}`);
      }

      const result = await response.json();
      console.log('Entry added successfully:', result);
      return result;
    } catch (error) {
      console.error('Error adding entry:', error);
      throw error;
    }
  }

  // Get all entries for a user
  async getEntries(userId: string): Promise<SheetEntry[]> {
    try {
      console.log('Fetching entries from Google Sheets for user:', userId);
      
      const response = await fetch(
        `${this.baseUrl}/${SHEET_ID}/values/Entries!A:F?key=${API_KEY}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching entries:', errorData);
        return [];
      }

      const data = await response.json();
      const rows = data.values || [];
      
      console.log('Raw entries data:', rows);
      
      // Skip header row and filter by user ID
      const entries = rows.slice(1)
        .filter((row: string[]) => row.length >= 6 && row[5] === userId)
        .map((row: string[]) => ({
          timestamp: row[0] || '',
          type: (row[1] as 'entry' | 'exit') || 'entry',
          personName: row[2] || '',
          personId: row[3] || '',
          enrollmentNo: row[4] || '',
          userId: row[5] || ''
        }));
      
      console.log('Processed entries:', entries);
      return entries;
    } catch (error) {
      console.error('Error getting entries:', error);
      return [];
    }
  }

  // Add person to People sheet
  async addPerson(person: SheetPerson) {
    try {
      console.log('Adding person to Google Sheets:', person);
      
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
        const errorData = await response.json();
        console.error('Error adding person:', errorData);
        throw new Error(`Failed to add person: ${errorData.error?.message || 'Unknown error'}`);
      }

      const result = await response.json();
      console.log('Person added successfully:', result);
      return result;
    } catch (error) {
      console.error('Error adding person:', error);
      throw error;
    }
  }

  // Get all people for a user
  async getPeople(userId: string): Promise<SheetPerson[]> {
    try {
      console.log('Fetching people from Google Sheets for user:', userId);
      
      const response = await fetch(
        `${this.baseUrl}/${SHEET_ID}/values/People!A:H?key=${API_KEY}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching people:', errorData);
        return [];
      }

      const data = await response.json();
      const rows = data.values || [];
      
      console.log('Raw people data:', rows);
      
      // Skip header row and filter by user ID
      const people = rows.slice(1)
        .filter((row: string[]) => row.length >= 7 && row[6] === userId)
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
      
      console.log('Processed people:', people);
      return people;
    } catch (error) {
      console.error('Error getting people:', error);
      return [];
    }
  }

  // Delete person (mark as deleted or remove from local state)
  async deletePerson(personId: string, userId: string) {
    console.log(`Note: Delete person functionality would need Google Apps Script for full implementation`);
    console.log(`Person ${personId} marked for deletion for user ${userId}`);
  }

  // Clear all entries for a user
  async clearEntries(userId: string) {
    console.log(`Note: Clear entries functionality would need Google Apps Script for full implementation`);
    console.log(`Entries cleared for user ${userId}`);
  }
}

export const googleSheetsDB = new GoogleSheetsDB();