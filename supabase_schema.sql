-- Clean up existing tables to apply new schema
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS issues CASCADE;
DROP TABLE IF EXISTS updates CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

-- Create clients table
CREATE TABLE clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'on-track' CHECK (status IN ('on-track', 'waiting', 'blocked')),
    deadline DATE,
    links JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create issues table
CREATE TABLE issues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'closed')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    assigned_to TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create updates table
CREATE TABLE updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
    issue_id UUID REFERENCES issues(id) ON DELETE SET NULL,
    update_text TEXT NOT NULL,
    meeting_notes TEXT,
    next_action TEXT,
    responsible_person TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access for clients" ON clients FOR SELECT USING (true);
CREATE POLICY "Allow public insert access for clients" ON clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete access for clients" ON clients FOR DELETE USING (true);
CREATE POLICY "Allow public update access for clients" ON clients FOR UPDATE USING (true);

CREATE POLICY "Allow public read access for updates" ON updates FOR SELECT USING (true);
CREATE POLICY "Allow public insert access for updates" ON updates FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete access for updates" ON updates FOR DELETE USING (true);

CREATE POLICY "Allow public read access for issues" ON issues FOR SELECT USING (true);
CREATE POLICY "Allow public insert access for issues" ON issues FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete access for issues" ON issues FOR DELETE USING (true);
CREATE POLICY "Allow public update access for issues" ON issues FOR UPDATE USING (true);

-- Create team_members table
CREATE TABLE team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    role TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for team_members
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access for team_members" ON team_members FOR SELECT USING (true);
CREATE POLICY "Allow public insert access for team_members" ON team_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete access for team_members" ON team_members FOR DELETE USING (true);
