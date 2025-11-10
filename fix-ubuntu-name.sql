-- Fix Ubuntu platform name
UPDATE platforms 
SET name = 'Ubuntu' 
WHERE id = 'ubuntu' AND name = 'Ubuntu/Debian';

-- Verify the change
SELECT id, name, package_manager FROM platforms WHERE id IN ('ubuntu', 'debian');
