-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table to store GitHub repository information
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    github_owner VARCHAR(255) NOT NULL,
    github_repo VARCHAR(255) NOT NULL,
    github_project_number INTEGER NOT NULL,
    github_token_encrypted TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(github_owner, github_repo, github_project_number)
);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    github_username VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, github_username)
);

-- Work items table for GitHub project items
CREATE TABLE IF NOT EXISTS work_items (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    github_item_id VARCHAR(255) NOT NULL,
    github_issue_number INTEGER,
    title TEXT NOT NULL,
    status VARCHAR(100),
    assignee_id INTEGER REFERENCES team_members(id),
    size_estimate INTEGER,
    priority VARCHAR(50),
    item_type VARCHAR(50),
    start_date DATE,
    end_date DATE,
    milestone VARCHAR(255),
    iteration_title VARCHAR(255),
    iteration_start_date DATE,
    iteration_duration INTEGER,
    github_data JSONB, -- Store full GitHub API response
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, github_item_id)
);

-- Sync tracking table
CREATE TABLE IF NOT EXISTS sync_logs (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    sync_type VARCHAR(50) NOT NULL, -- 'full', 'incremental'
    status VARCHAR(50) NOT NULL, -- 'success', 'error', 'in_progress'
    items_synced INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add iteration fields if they don't exist (for existing databases)
ALTER TABLE work_items ADD COLUMN IF NOT EXISTS iteration_title VARCHAR(255);
ALTER TABLE work_items ADD COLUMN IF NOT EXISTS iteration_start_date DATE;
ALTER TABLE work_items ADD COLUMN IF NOT EXISTS iteration_duration INTEGER;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_work_items_project_id ON work_items(project_id);
CREATE INDEX IF NOT EXISTS idx_work_items_status ON work_items(status);
CREATE INDEX IF NOT EXISTS idx_work_items_assignee ON work_items(assignee_id);
CREATE INDEX IF NOT EXISTS idx_work_items_updated_at ON work_items(updated_at);
CREATE INDEX IF NOT EXISTS idx_work_items_iteration ON work_items(iteration_title);
CREATE INDEX IF NOT EXISTS idx_team_members_project_id ON team_members(project_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_project_id ON sync_logs(project_id);