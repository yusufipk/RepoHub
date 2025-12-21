-- Migration: Separate Ubuntu and Debian platforms
-- Created: 2025-12-08

-- Add Debian as a separate platform
INSERT INTO platforms (id, name, package_manager, icon, created_at, updated_at)
VALUES ('debian', 'Debian', 'apt', '🌀', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Update Ubuntu name (remove /Debian)
UPDATE platforms 
SET name = 'Ubuntu', updated_at = NOW()
WHERE id = 'ubuntu' AND name = 'Ubuntu/Debian';

-- Note: Existing packages with platform_id 'ubuntu' will remain as Ubuntu packages
-- New Debian-specific packages should be added with platform_id 'debian'

