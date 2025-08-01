import { execSync } from 'child_process';

console.log('Building for Vercel...');

// Build the client
console.log('Building client...');
execSync('npm run build', { stdio: 'inherit' });

console.log('Build completed successfully!');