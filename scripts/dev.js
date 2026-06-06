const { spawn } = require('node:child_process');

const procs = [
  { name: 'backend', cmd: 'npm', args: ['run', 'dev'], cwd: 'backend', color: '\x1b[36m' },
  { name: 'frontend', cmd: 'npm', args: ['start'], cwd: 'frontend', color: '\x1b[35m' },
];

const RESET = '\x1b[0m';
const children = [];

function shutdown(code = 0) {
  for (const child of children) {
    if (!child.killed) child.kill();
  }
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

for (const proc of procs) {
  const child = spawn(proc.cmd, proc.args, { cwd: proc.cwd, shell: true });

  child.stdout.on('data', (chunk) => {
    process.stdout.write(`${proc.color}[${proc.name}]${RESET} ${chunk}`);
  });
  child.stderr.on('data', (chunk) => {
    process.stderr.write(`${proc.color}[${proc.name}]${RESET} ${chunk}`);
  });
  child.on('exit', (code) => {
    console.log(`[${proc.name}] exited with code ${code}`);
    shutdown(code ?? 0);
  });
  children.push(child);
}
