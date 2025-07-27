# Welcome to your Lovable project

## Supabase Setup Instructions

To set up the database for this Entry/Exit Tracker application:

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new account or sign in
3. Click "New Project"
4. Choose your organization and enter project details
5. Wait for the project to be created

### 2. Set up the Database
1. In your Supabase dashboard, go to the SQL Editor
2. Copy the contents of `supabase-setup.sql` from this project
3. Paste it into the SQL Editor and run it
4. This will create the necessary tables and security policies

### 3. Configure Environment Variables
1. In your Supabase dashboard, go to Settings > API
2. Copy your Project URL and anon/public key
3. Create a `.env` file in your project root (copy from `.env.example`)
4. Add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_project_url_here
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

### 4. Enable Authentication
1. In Supabase dashboard, go to Authentication > Settings
2. Make sure "Enable email confirmations" is turned OFF for development
3. You can now create user accounts through the login page

### 5. Test the Application
1. Start the development server: `npm run dev`
2. Go to the login page and create a new account
3. All entries, exits, and people data will be saved to your Supabase database

## Project info

**URL**: https://lovable.dev/projects/19f01c35-1321-4f1b-8208-fd1693c0de6e

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/19f01c35-1321-4f1b-8208-fd1693c0de6e) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/19f01c35-1321-4f1b-8208-fd1693c0de6e) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
