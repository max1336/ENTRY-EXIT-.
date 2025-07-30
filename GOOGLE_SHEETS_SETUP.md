# Google Sheets Database Setup Guide

This guide will help you set up Google Sheets as your database for the Entry/Exit Tracker application.

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Rename it to "Entry Exit Tracker Database"
4. Create two sheets (tabs) with these exact names:
   - `Entries`
   - `People`

## Step 2: Set up the Entries Sheet

1. Click on the "Entries" tab
2. In row 1, add these headers in columns A-F:
   ```
   A1: Timestamp
   B1: Type
   C1: Person Name
   D1: Person ID
   E1: Enrollment No
   F1: User ID
   ```

## Step 3: Set up the People Sheet

1. Click on the "People" tab
2. In row 1, add these headers in columns A-H:
   ```
   A1: ID
   B1: Name
   C1: Enrollment No
   D1: Email
   E1: Phone
   F1: QR Code Data
   G1: User ID
   H1: Created At
   ```

## Step 4: Get Your Google Sheet ID

1. Look at your Google Sheet URL
2. Copy the ID from the URL (the long string between `/d/` and `/edit`)
   
   Example URL: `https://docs.google.com/spreadsheets/d/1uqwoyKauV2gzBFmBN6dXpWOWQYTApoZvf3mqpf9A3Zw/edit`
   
   Sheet ID: `1uqwoyKauV2gzBFmBN6dXpWOWQYTApoZvf3mqpf9A3Zw`

## Step 5: Enable Google Sheets API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click on it and press "Enable"

## Step 6: Create API Key

1. In Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key
4. (Optional) Restrict the API key to only Google Sheets API for security

## Step 7: Make Your Sheet Public (Read-Only)

**CRITICAL STEP:** Your Google Sheet must be publicly accessible for the API to work.

1. In your Google Sheet, click the "Share" button (top right)
2. Click "Change to anyone with the link"
3. Make sure it's set to "Viewer" permissions
4. Click "Copy link" to verify the sharing is working

## Step 8: Configure Your Application

Your `.env` file has been created with your credentials:
```env
VITE_GOOGLE_SHEET_ID=1uqwoyKauV2gzBFmBN6dXpWOWQYTApoZvf3mqpf9A3Zw
VITE_GOOGLE_API_KEY=AIzaSyCRXRXnVryLfXn5KOpfAFeFx_meAGzJxb4
```

## Step 9: Test Your Setup

1. Start your application: `npm run dev`
2. The app should connect to Google Sheets automatically
3. Try adding a person and recording entries
4. Check your Google Sheet to see if data appears

## Important Notes

- The Google Sheets API has usage limits (100 requests per 100 seconds per user)
- All data is stored in Google Sheets, making it easily accessible and editable
- QR codes contain person information in JSON format
- The application works offline for QR scanning but requires internet for data saving

## Troubleshooting

**Error: "API key not valid"**
- Make sure your API key is correct
- Check that Google Sheets API is enabled in Google Cloud Console
- Verify the API key restrictions (if any)

**Error: "The caller does not have permission"**
- Make sure your sheet is shared publicly with "Anyone with the link can view"
- Check that the sheet ID is correct
- Ensure the sheet exists and is accessible

**Error: "Sheet not accessible"**
- Verify your sheet has the correct headers in the right columns
- Make sure the sheet names are exactly "Entries" and "People"
- Check that both tabs exist in your Google Sheet

**Data not appearing**
- Check the browser console for error messages
- Verify the sheet structure matches the requirements
- Make sure you have internet connection

## Current Configuration

✅ **Sheet ID**: 1uqwoyKauV2gzBFmBN6dXpWOWQYTApoZvf3mqpf9A3Zw  
✅ **API Key**: AIzaSyCRXRXnVryLfXn5KOpfAFeFx_meAGzJxb4  

Make sure your Google Sheet is set up with the correct structure and is publicly accessible!