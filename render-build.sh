#!/bin/bash

# Render build script

# Install dependencies
echo "Installing dependencies..."
npm install

# Ensure we have the right global tools
echo "Installing global dependencies..."
npm install -g @sveltejs/kit vite

# Sync SvelteKit
echo "Syncing SvelteKit..."
npx svelte-kit sync

# Build the app
echo "Building the application..."
npx vite build

echo "Build completed successfully!" 