-- Add 'aur' to repository check constraint
ALTER TABLE packages DROP CONSTRAINT IF EXISTS packages_repository_check;
ALTER TABLE packages
  ADD CONSTRAINT packages_repository_check
  CHECK (repository IN ('official','third-party','aur'));
