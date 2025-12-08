-- Migration: Add OpenSUSE and Gentoo platforms
-- Created: 2025-12-08
-- Related to issue: #8

-- Add OpenSUSE platform
INSERT INTO platforms (id, name, package_manager, icon, created_at, updated_at)
VALUES ('opensuse', 'openSUSE', 'zypper', '🦎', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Add Gentoo platform  
INSERT INTO platforms (id, name, package_manager, icon, created_at, updated_at)
VALUES ('gentoo', 'Gentoo', 'emerge', '🗜️', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

