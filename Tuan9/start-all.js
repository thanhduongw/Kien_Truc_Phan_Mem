import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('\x1b[1m\x1b[32mStarting Travel Booking System...\x1b[0m');

// 1. Start Backend via Docker Compose
console.log('\x1b[36m[System] Starting Backend services via Docker Compose...\x1b[0m');
const dockerProcess = spawn('docker-compose', ['up', '--build'], {
  cwd: __dirname,
  shell: true,
  stdio: 'inherit' // Pipe output directly to terminal
});

// 2. Start Frontend locally
console.log('\x1b[36m[System] Starting Frontend locally...\x1b[0m');
const frontendProcess = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  shell: true
});

frontendProcess.stdout.on('data', (data) => {
  console.log(`\x1b[37m[Frontend]\x1b[0m ${data.toString().trim()}`);
});

frontendProcess.stderr.on('data', (data) => {
  console.error(`\x1b[31m[Frontend ERROR]\x1b[0m ${data.toString().trim()}`);
});

process.on('SIGINT', () => {
  console.log('\n\x1b[33m[System] Stopping services...\x1b[0m');
  dockerProcess.kill();
  frontendProcess.kill();
  process.exit();
});
