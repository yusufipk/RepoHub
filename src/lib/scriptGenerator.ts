import { SelectedPackage, Platform, GeneratedScript } from '@/types'

export function generateScript(packages: SelectedPackage[], platform: Platform): GeneratedScript {
  const script = createScriptContent(packages, platform)
  
  return {
    platform: platform.id,
    script,
    packages,
    generatedAt: new Date().toISOString()
  }
}

function createScriptContent(packages: SelectedPackage[], platform: Platform): string {
  switch (platform.id) {
    case 'debian':
    case 'ubuntu':
      return generateDebianBasedScript(packages, platform.name)
    case 'fedora':
      return generateFedoraScript(packages)
    case 'arch':
      return generateArchScript(packages)
    case 'windows':
      return generateWindowsScript(packages)
    case 'macos':
      return generateMacOSScript(packages)
    default:
      throw new Error(`Unsupported platform: ${platform.id}`)
  }
}

function generateDebianBasedScript(packages: SelectedPackage[], platformName: string): string {
  const packageNames = packages.map(p => p.name).join(' ')
  
  return `#!/bin/bash

# RepoHub Installation Script for ${platformName}
# Generated on ${new Date().toISOString()}
# This script is idempotent and safe to run multiple times

set -e

echo "Starting package installation for ${platformName}..."

# Update package lists
echo "Updating package lists..."
sudo apt update

# Install packages
echo "Installing packages: ${packageNames}"
sudo apt install -y ${packageNames}

# Verify installation
echo "Verifying installation..."
for package in ${packageNames}; do
    if dpkg -l | grep -q "^ii  $package "; then
        echo "✓ $package installed successfully"
    else
        echo "✗ $package installation failed"
    fi
done

echo "Installation completed!"`
}

function generateFedoraScript(packages: SelectedPackage[]): string {
  const packageNames = packages.map(p => p.name).join(' ')
  
  return `#!/bin/bash

# RepoHub Installation Script for Fedora
# Generated on ${new Date().toISOString()}
# This script is idempotent and safe to run multiple times

set -e

echo "Starting package installation for Fedora..."

# Update package lists
echo "Updating package lists..."
sudo dnf update -y

# Install packages
echo "Installing packages: ${packageNames}"
sudo dnf install -y ${packageNames}

# Verify installation
echo "Verifying installation..."
for package in ${packageNames}; do
    if rpm -q $package >/dev/null 2>&1; then
        echo "✓ $package installed successfully"
    else
        echo "✗ $package installation failed"
    fi
done

echo "Installation completed!"`
}

function generateArchScript(packages: SelectedPackage[]): string {
  const packageNames = packages.map(p => p.name).join(' ')
  
  return `#!/bin/bash

# RepoHub Installation Script for Arch Linux
# Generated on ${new Date().toISOString()}
# This script is idempotent and safe to run multiple times

set -e

echo "Starting package installation for Arch Linux..."

# Update package lists
echo "Updating package lists..."
sudo pacman -Sy --noconfirm

# Install packages
echo "Installing packages: ${packageNames}"
sudo pacman -S --noconfirm ${packageNames}

# Verify installation
echo "Verifying installation..."
for package in ${packageNames}; do
    if pacman -Qi $package >/dev/null 2>&1; then
        echo "✓ $package installed successfully"
    else
        echo "✗ $package installation failed"
    fi
done

echo "Installation completed!"`
}

function generateWindowsScript(packages: SelectedPackage[]): string {
  const packageNames = packages.map(p => p.id).join(' ')
  
  return `# RepoHub Installation Script for Windows
# Generated on ${new Date().toISOString()}
# This script is idempotent and safe to run multiple times

Write-Host "Starting package installation for Windows..."

# Install packages using winget
Write-Host "Installing packages: ${packageNames}"

$packages = @(${packages.map(p => `'${p.id}'`).join(', ')})

foreach ($package in $packages) {
    Write-Host "Installing $package..."
    try {
        winget install --id $package --accept-package-agreements --accept-source-agreements -e
        Write-Host "✓ $package installed successfully"
    } catch {
        Write-Host "✗ $package installation failed: $_"
    }
}

Write-Host "Installation completed!"`
}

function generateMacOSScript(packages: SelectedPackage[]): string {
  const packageNames = packages.map(p => p.name).join(' ')
  
  return `#!/bin/bash

# RepoHub Installation Script for macOS
# Generated on ${new Date().toISOString()}
# This script is idempotent and safe to run multiple times

set -e

echo "Starting package installation for macOS..."

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "Homebrew is not installed. Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
    echo "Homebrew is already installed. Updating..."
    brew update
fi

# Install packages
echo "Installing packages: ${packageNames}"
brew install ${packageNames}

# Verify installation
echo "Verifying installation..."
for package in ${packageNames}; do
    if brew list --formula | grep -q "^$package$"; then
        echo "✓ $package installed successfully"
    else
        echo "✗ $package installation failed"
    fi
done

echo "Installation completed!"
}`
}
