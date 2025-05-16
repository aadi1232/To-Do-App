#!/usr/bin/env node

/**
 * Custom build script for Vercel deployment
 * This script runs the necessary commands for building the SvelteKit app
 * in a way that works reliably in Vercel's build environment
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory path
const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('Starting custom Vercel build process...');

try {
	// Show Node version information
	console.log('Node.js environment information:');
	execSync('node --version', { stdio: 'inherit' });
	execSync('npm --version', { stdio: 'inherit' });

	// First, ensure dependencies are installed
	console.log('Installing dependencies...');
	execSync('npm install', { stdio: 'inherit' });

	// List the relevant directories for debugging
	console.log('Checking for node_modules/.bin contents:');
	execSync('ls -la node_modules/.bin', { stdio: 'inherit' });

	// Create a direct build script to avoid using node_modules/.bin paths
	console.log('Creating direct build script...');
	const buildScript = `
		console.log('Starting direct build process');
		
		// First require the sync function from @sveltejs/kit
		try {
			console.log('Attempting to import @sveltejs/kit/sync');
			const { sync } = await import('@sveltejs/kit/sync');
			console.log('Sync imported successfully');
			
			// Run sync
			console.log('Running sync...');
			await sync();
			console.log('Sync completed');
			
			// Then run vite build
			console.log('Running Vite build...');
			const { build } = await import('vite');
			await build();
			console.log('Build completed');
		} catch (err) {
			console.error('Build script error:', err);
			process.exit(1);
		}
	`;

	// Write the script to a file
	const fs = await import('fs/promises');
	await fs.writeFile('direct-build.mjs', buildScript);

	// Execute the direct build script
	console.log('Executing direct build script...');
	execSync('node direct-build.mjs', { stdio: 'inherit' });

	console.log('Build completed successfully!');
} catch (error) {
	console.error('Build failed:', error.message);
	process.exit(1);
}
