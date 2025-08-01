#!/usr/bin/env node

// Simple build script for Vercel deployment
const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting Vercel build process...');

try {
  // Ensure we're in the right directory
  process.chdir(__dirname);
  
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('🏗️  Building frontend with Vite...');
  execSync('npx vite build --config vite.config.vercel.ts', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}