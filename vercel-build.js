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

// Check that node_modules exists
if (!existsSync(path.join(__dirname, 'node_modules'))) {
	console.log('Installing dependencies...');
	execSync('npm install', { stdio: 'inherit' });
}

try {
	// Run svelte-kit sync using the local version
	console.log('Running svelte-kit sync...');
	execSync('node ./node_modules/.bin/svelte-kit sync', {
		stdio: 'inherit',
		cwd: __dirname
	});

	// Run vite build using the local version
	console.log('Running vite build...');
	execSync('node ./node_modules/.bin/vite build', {
		stdio: 'inherit',
		cwd: __dirname
	});

	console.log('Build completed successfully!');
} catch (error) {
	console.error('Build failed:', error.message);
	process.exit(1);
}
