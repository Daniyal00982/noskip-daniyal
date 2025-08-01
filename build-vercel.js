import { execSync } from 'child_process';
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

console.log('🚀 Building Noskip for Vercel deployment...');

try {
  // Create dist directory if it doesn't exist
  if (!existsSync('dist')) {
    mkdirSync('dist', { recursive: true });
  }
  
  // Build the client using npx to ensure vite is available
  console.log('📦 Building client...');
  execSync('npx vite build --config vite.config.vercel.ts', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  // Copy package.json for deployment
  console.log('📋 Copying package.json...');
  copyFileSync('package.json', 'dist/package.json');

  console.log('✅ Build completed successfully!');
  console.log('📁 Static files ready in: dist/public');
  console.log('🌐 API functions ready in: api/');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}