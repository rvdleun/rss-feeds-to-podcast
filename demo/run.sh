#!/bin/bash

# Get project root based on script location
SCRIPT_PATH=$(readlink -f "$0")
SCRIPT_DIR="$(dirname "$SCRIPT_PATH")"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
echo $SCRIPT_DIR
echo $PROJECT_ROOT

echo 'RSS Feeds to Podcast - Demo Setup'
echo '================================='
echo ''
echo 'This script will:'
echo '1. Start external services (Ollama LLM, Kokoro TTS, Web Scraper) via Docker'
echo '2. Install project dependencies'
echo '3. Generate a podcast based on configuration in the config/ directory'
echo ''
echo 'Prerequisites:'
echo '* Docker and Docker Compose must be installed and running'
echo '* FFmpeg must be installed: `sudo apt-get install ffmpeg` (Linux) or `brew install ffmpeg` (Mac)'
echo '* Node.js 20+ and npm 10+ (consider using nvm for version management)'
echo '* Configuration files must exist in config/ directory (copy from config.example/)'
echo ''
echo 'Performance Notes:'
echo '* Ollama may be slow in resource-constrained environments like GitHub Codespaces'
echo '* For faster generation, configure OpenAI or another cloud LLM service in config/external-services.yaml'
echo '  * After setup, validate your configuration with: `npm run start -- validate-external-services`'
echo '* Initial Docker image pulls may take several minutes'
echo ''

printf "Press Enter to continue or Ctrl+C to cancel..." > /dev/tty
read dummy < /dev/tty

echo "Starting external services..."
cd "$PROJECT_ROOT/external-services"
sh start-all.sh

echo "Setting up Node.js environment..."
cd "$PROJECT_ROOT"
nvm use

echo "Installing dependencies..."
npm install

echo "Cleaning previous output..."
rm -rf output

echo "Starting podcast generation..."
npm run start -- -Y