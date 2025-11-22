-- Migration: increase packages.version length to 255
-- Run this against your existing database (PostgreSQL)

ALTER TABLE packages
  ALTER COLUMN version TYPE VARCHAR(255);

-- Optional: verify
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'packages' AND column_name = 'version';
