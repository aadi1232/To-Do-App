#!/usr/bin/env node

/**
 * Simpler build script for Vercel
 * This script uses direct npm commands which are available in the PATH
 */

import { execSync } from 'child_process';

console.log('Starting simplified Vercel build process...');

try {
	// Print environment info
	console.log('Node version:');
	execSync('node --version', { stdio: 'inherit' });

	console.log('NPM version:');
	execSync('npm --version', { stdio: 'inherit' });

	// Install dependencies
	console.log('Installing dependencies...');
	execSync('npm install', { stdio: 'inherit' });

	// Run svelte-kit sync via npm
	console.log('Running svelte-kit sync...');
	execSync('npm run sync', { stdio: 'inherit' });

	// Run vite build
	console.log('Running vite build...');
	execSync('npm run build', { stdio: 'inherit' });

	console.log('Build completed successfully!');
} catch (error) {
	console.error('Build failed:', error);
	process.exit(1);
}
