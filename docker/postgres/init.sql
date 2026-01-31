-- Initialize PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Create initial database schema if needed
-- This script runs only on first container creation

-- Set timezone
SET timezone = 'Asia/Riyadh';

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'Database initialized with PostGIS extension';
END $$;