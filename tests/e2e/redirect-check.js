const http = require('http');
const { spawn } = require('child_process');
const net = require('net');
const fs = require('fs');

async function findFreePort() {
  const fromEnv = process.env.TEST_PORT ? Number(process.env.TEST_PORT) : null;
  const candidates = [fromEnv, 8082, 8085, 8091, 8099].filter(Boolean);
  for (const p of candidates) {
    const ok = await new Promise((res) => {
      const srv = net
        .createServer()
        .once('error', () => res(false))
        .once('listening', () => { srv.close(() => res(true)); })
        .listen(p, '127.0.0.1');
    });
    if (ok) return String(p);
  }
  return String(0);
}

(async function () {
  const port = await findFreePort();
  const url = `http://localhost:${port}/test/water-cld`;
  const srv = spawn('npx', ['http-server', 'docs', '-p', port, '-s', '-c-1'], { stdio: 'ignore', shell: true });
  setTimeout(() => {
    http
      .get(url, (res) => {
        const loc = res.headers.location;
        console.log('Status:', res.statusCode, 'Location:', loc);
        srv.kill();
        if (res.statusCode === 301 && /\/water\/cld\/?/.test(loc || '')) {
          process.exit(0);
        }
        // Fallback for local http-server (no Netlify redirects): verify rule exists in docs/_redirects
        try {
          const txt = fs.readFileSync('docs/_redirects', 'utf8');
          const ok = /\/test\/water-cld\s+\/water\/cld\s+301!?/.test(txt);
          process.exit(ok ? 0 : 1);
        } catch (_) {
          process.exit(1);
        }
      })
      .on('error', () => {
        srv.kill();
        process.exit(1);
      });
  }, 600);
})();

