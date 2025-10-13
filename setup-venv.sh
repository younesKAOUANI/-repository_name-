#!/bin/bash

# Setup Python virtual environment for Pharmapedia
# Run this script to set up the Python environment

set -e

echo "🐍 Setting up Python virtual environment for Pharmapedia..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed. Please install Python3 first."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Install requirements
if [ -f "requirements.txt" ]; then
    echo "📋 Installing Python dependencies..."
    pip install -r requirements.txt
else
    echo "⚠️ requirements.txt not found, skipping Python dependencies"
fi

echo ""
echo "✅ Python virtual environment setup complete!"
echo ""
echo "To activate the virtual environment, run:"
echo "  source venv/bin/activate"
echo ""
echo "To deactivate, run:"
echo "  deactivate"
echo ""
echo "To install new packages:"
echo "  pip install package_name"
echo "  pip freeze > requirements.txt"