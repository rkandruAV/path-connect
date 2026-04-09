#!/bin/bash
# Dify Quick Setup Script
# Run from the project root: bash dify/setup.sh

set -e

DIFY_DIR="dify/dify-source"

echo "=== PathConnect: Dify Setup ==="

# Check if Dify is already cloned
if [ -d "$DIFY_DIR" ]; then
  echo "Dify source already exists at $DIFY_DIR"
  echo "To update, run: cd $DIFY_DIR && git pull"
else
  echo "Cloning latest Dify release..."
  LATEST_TAG=$(curl -s https://api.github.com/repos/langgenius/dify/releases/latest | grep -o '"tag_name": "[^"]*' | grep -o '[^"]*$')
  git clone --branch "$LATEST_TAG" --depth 1 https://github.com/langgenius/dify.git "$DIFY_DIR"
fi

# Configure environment
cd "$DIFY_DIR/docker"
if [ ! -f .env ]; then
  echo "Creating Dify .env from template..."
  cp .env.example .env
else
  echo "Dify .env already exists"
fi

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "  1. cd $DIFY_DIR/docker && docker compose up -d"
echo "  2. Open http://localhost/install"
echo "  3. Create your Dify admin account"
echo "  4. Add your LLM provider in Settings → Model Provider"
echo ""
