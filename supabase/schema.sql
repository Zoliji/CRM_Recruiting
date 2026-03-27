-- ============================================
-- CRM Recruiting — Supabase Schema
-- ============================================

-- Team members (linked to Supabase Auth)
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'recruiter' CHECK (role IN ('admin','recruiter','viewer')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Job positions
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  department TEXT,
  location TEXT,
  type TEXT DEFAULT 'full-time' CHECK (type IN ('full-time','part-time','contract','internship')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open','closed','paused')),
  description TEXT,
  salary_range TEXT,
  assigned_to UUID REFERENCES team_members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Candidates
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  current_company TEXT,
  current_job_role TEXT,
  source TEXT,
  notes TEXT,
  resume_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Pipeline stages
CREATE TABLE pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  order_index INT NOT NULL,
  color TEXT DEFAULT '#6366f1'
);

-- Applications (candidate <-> job + pipeline stage)
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  stage_id UUID REFERENCES pipeline_stages(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES team_members(id) ON DELETE SET NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Interviews
CREATE TABLE interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  interviewer_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT DEFAULT 60,
  type TEXT DEFAULT 'video' CHECK (type IN ('video','phone','in-person')),
  location TEXT,
  notes TEXT,
  feedback TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Activity log
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Default Pipeline Stages
-- ============================================
INSERT INTO pipeline_stages (name, order_index, color) VALUES
  ('Applied',    0, '#6366f1'),
  ('Screening',  1, '#8b5cf6'),
  ('Interview',  2, '#a78bfa'),
  ('Technical',  3, '#c084fc'),
  ('Offer',      4, '#22c55e'),
  ('Hired',      5, '#10b981'),
  ('Rejected',   6, '#ef4444');

-- ============================================
-- Row Level Security (RLS)
-- ============================================
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read/write all data (team CRM)
CREATE POLICY "Team full access" ON team_members FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Team full access" ON jobs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Team full access" ON candidates FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Team full access" ON applications FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Team full access" ON interviews FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Team full access" ON activities FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Team full access" ON pipeline_stages FOR ALL USING (auth.role() = 'authenticated');
