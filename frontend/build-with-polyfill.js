#!/usr/bin/env node

/* eslint-env node */
/* eslint-disable no-undef */

// Enhanced build script with better Node version handling and crypto polyfill
import { execSync } from 'node:child_process';

console.log('Node version:', process.version);
console.log('NPM version:', process.env.npm_config_version || 'unknown');
console.log('Starting build with enhanced crypto polyfill...');

// Check if we're running on Node 20+
const nodeVersion = parseInt(process.version.split('.')[0].replace('v', ''));
if (nodeVersion < 20) {
  console.warn(`Warning: Node.js version ${process.version} detected. This project requires Node.js 20+.`);
  console.warn('Some features may not work correctly.');
}

// Set environment variables for crypto polyfills
process.env.NODE_OPTIONS = '--experimental-specifier-resolution=node --max-old-space-size=4096';

// Continue with the build
try {
  execSync('vite build', {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: '--experimental-specifier-resolution=node --max-old-space-size=4096'
    }
  });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  console.error('Exit code:', error.status);
  process.exit(error.status || 1);
}
