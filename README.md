# Client Update Hub Setup Instructions

Follow these steps to get your Client Update Hub up and running.

## 1. Supabase Setup
1. Go to [Supabase](https://supabase.com/) and create a new project.
2. Once the project is created, go to the **SQL Editor** in the Supabase dashboard.
3. Copy the contents of `supabase_schema.sql` (found in this directory) and run it in the SQL Editor. This will create the `clients` and `updates` tables with the correct permissions.

## 2. Environment Variables
1. In the Supabase dashboard, go to **Project Settings** > **API**.
2. Copy your **Project URL** and **anon public Key**.
3. Open the `.env` file in this directory.
4. Replace `YOUR_SUPABASE_URL_HERE` with your Project URL.
5. Replace `YOUR_SUPABASE_ANON_KEY_HERE` with your anon public Key.

## 3. Run the Application
1. Open your terminal in the `d:/Client Update Hub` directory.
2. Run `npm run dev` to start the development server.
3. Open the URL provided in the terminal (usually `http://localhost:5173`).

## Features
- **Project Management**: Add new projects/clients from the sidebar.
- **Update Timeline**: Click on any project to see its full update history in a clean timeline format.
- **Search**: Quickly find projects using the dashboard search bar.
- **Premium Design**: Dark mode interface with glassmorphism and smooth animations.
