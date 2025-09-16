#!/usr/bin/env node

/* eslint-env node */

// Enhanced build script with better Node version handling and crypto polyfill
import { execSync } from 'child_process';

console.log('Node version:', process.version); // eslint-disable-line no-undef
console.log('NPM version:', process.env.npm_config_version || 'unknown'); // eslint-disable-line no-undef
console.log('Starting build with enhanced crypto polyfill...');

// Check if we're running on Node 20+
const nodeVersion = parseInt(process.version.split('.')[0].replace('v', '')); // eslint-disable-line no-undef
if (nodeVersion < 20) {
  console.warn(`Warning: Node.js version ${process.version} detected. This project requires Node.js 20+.`); // eslint-disable-line no-undef
  console.warn('Some features may not work correctly.');
}

// Set environment variables for crypto polyfills
process.env.NODE_OPTIONS = '--experimental-specifier-resolution=node --max-old-space-size=4096'; // eslint-disable-line no-undef

// Continue with the build
try {
  execSync('vite build', {
    stdio: 'inherit',
    env: {
      ...process.env, // eslint-disable-line no-undef
      NODE_OPTIONS: '--experimental-specifier-resolution=node --max-old-space-size=4096'
    }
  });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  console.error('Exit code:', error.status);
  process.exit(error.status || 1); // eslint-disable-line no-undef
}
