#!/bin/bash
set -e

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Installing Node.js dependencies for cyber-deck-protocol..."
cd cyber-deck-protocol
npm install

echo "Setup complete."
