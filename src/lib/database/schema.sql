-- RepoHub Database Schema
-- PostgreSQL schema for package metadata management

-- Platforms table
CREATE TABLE platforms (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    package_manager VARCHAR(50) NOT NULL,
    icon VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Licenses table
CREATE TABLE licenses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Packages table
CREATE TABLE packages (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    version VARCHAR(255),
    platform_id VARCHAR(50) NOT NULL REFERENCES platforms(id),
    category_id INTEGER REFERENCES categories(id),
    license_id INTEGER REFERENCES licenses(id),
    type VARCHAR(10) CHECK (type IN ('gui', 'cli')),
    repository VARCHAR(20) CHECK (repository IN ('official', 'third-party', 'aur')),
    homepage_url VARCHAR(255),
    download_url VARCHAR(255),
    last_updated TIMESTAMP WITH TIME ZONE,
    downloads_count INTEGER DEFAULT 0,
    popularity_score INTEGER CHECK (popularity_score >= 0 AND popularity_score <= 100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Package tags junction table
CREATE TABLE package_tags (
    package_id VARCHAR(50) REFERENCES packages(id) ON DELETE CASCADE,
    tag VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (package_id, tag)
);

-- Package dependencies junction table
CREATE TABLE package_dependencies (
    package_id VARCHAR(50) REFERENCES packages(id) ON DELETE CASCADE,
    dependency_id VARCHAR(50) REFERENCES packages(id) ON DELETE CASCADE,
    dependency_type VARCHAR(20) CHECK (dependency_type IN ('required', 'optional', 'recommended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (package_id, dependency_id)
);

-- Metadata sync log table
CREATE TABLE metadata_sync_logs (
    id SERIAL PRIMARY KEY,
    platform_id VARCHAR(50) REFERENCES platforms(id),
    sync_type VARCHAR(20) CHECK (sync_type IN ('full', 'incremental')),
    status VARCHAR(20) CHECK (status IN ('running', 'completed', 'failed')),
    packages_processed INTEGER DEFAULT 0,
    packages_added INTEGER DEFAULT 0,
    packages_updated INTEGER DEFAULT 0,
    packages_removed INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_packages_platform_id ON packages(platform_id);
CREATE INDEX idx_packages_category_id ON packages(category_id);
CREATE INDEX idx_packages_type ON packages(type);
CREATE INDEX idx_packages_repository ON packages(repository);
CREATE INDEX idx_packages_is_active ON packages(is_active);
CREATE INDEX idx_packages_last_updated ON packages(last_updated);
CREATE INDEX idx_packages_popularity_score ON packages(popularity_score DESC);
CREATE INDEX idx_packages_name ON packages USING gin(to_tsvector('english', name));
CREATE INDEX idx_packages_description ON packages USING gin(to_tsvector('english', description));

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_platforms_updated_at BEFORE UPDATE ON platforms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Initial data
INSERT INTO platforms (id, name, package_manager, icon) VALUES
('ubuntu', 'Ubuntu/Debian', 'apt', '🐧'),
('fedora', 'Fedora', 'dnf', '🎩'),
('arch', 'Arch Linux', 'pacman', '🏛️'),
('opensuse', 'openSUSE', 'zypper', '🦎'),
('gentoo', 'Gentoo', 'emerge', '🗜️'),
('windows', 'Windows', 'winget', '🪟'),
('macos', 'macOS', 'homebrew', '🍎');

INSERT INTO categories (name, description) VALUES
('Development', 'Software development tools and IDEs'),
('Internet', 'Web browsers, email clients, and network tools'),
('Multimedia', 'Audio, video, and graphics applications'),
('System', 'System administration and utilities'),
('Communication', 'Chat, VoIP, and messaging applications'),
('Office', 'Productivity and office applications'),
('Graphics', 'Image editing and design tools'),
('Games', 'Games and gaming-related software'),
('Science', 'Scientific and educational software'),
('Utilities', 'General utility applications');

INSERT INTO licenses (name, url) VALUES
('MIT', 'https://opensource.org/licenses/MIT'),
('GPL-2.0', 'https://opensource.org/licenses/GPL-2.0'),
('GPL-3.0', 'https://opensource.org/licenses/GPL-3.0'),
('Apache-2.0', 'https://opensource.org/licenses/Apache-2.0'),
('BSD-2-Clause', 'https://opensource.org/licenses/BSD-2-Clause'),
('BSD-3-Clause', 'https://opensource.org/licenses/BSD-3-Clause'),
('MPL-2.0', 'https://opensource.org/licenses/MPL-2.0'),
('Proprietary', NULL),
('LGPL-2.1', 'https://opensource.org/licenses/LGPL-2.1'),
('LGPL-3.0', 'https://opensource.org/licenses/LGPL-3.0');
