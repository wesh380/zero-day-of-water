#!/usr/bin/env node
// Minimal static file server for the docs directory.
// Usage: node tools/dev-serve.js --port 5173 --dir docs

const http = require('http');
const path = require('path');
const fs = require('fs');

function parseArgs(){
  const args = process.argv.slice(2);
  const out = { port: 5173, dir: 'docs' };
  for (let i=0;i<args.length;i++){
    const a = args[i];
    if (a === '--port' && args[i+1]) { out.port = parseInt(args[++i], 10) || out.port; }
    else if (a === '--dir' && args[i+1]) { out.dir = String(args[++i]); }
  }
  return out;
}

const MIME = {
  '.html':'text/html; charset=utf-8',
  '.htm':'text/html; charset=utf-8',
  '.js':'application/javascript; charset=utf-8',
  '.mjs':'application/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8',
  '.json':'application/json; charset=utf-8',
  '.svg':'image/svg+xml',
  '.png':'image/png',
  '.jpg':'image/jpeg',
  '.jpeg':'image/jpeg',
  '.webp':'image/webp',
  '.ico':'image/x-icon',
  '.gif':'image/gif',
  '.woff':'font/woff',
  '.woff2':'font/woff2',
  '.ttf':'font/ttf',
  '.map':'application/json; charset=utf-8'
};

function serve(root){
  return http.createServer((req, res) => {
    try {
      const u = new URL(req.url, 'http://localhost');
      let reqPath = decodeURIComponent(u.pathname);
      if (reqPath.includes('..')) { res.statusCode = 400; return res.end('bad path'); }
      let filePath = path.join(root, reqPath);
      // If path is a folder (or ends with slash), serve index.html inside
      if (reqPath.endsWith('/') || (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory())) {
        filePath = path.join(filePath, 'index.html');
      }
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.statusCode = 404;
          return res.end('not found');
        }
        const ext = path.extname(filePath).toLowerCase();
        const type = MIME[ext] || 'application/octet-stream';
        res.setHeader('Content-Type', type);
        res.end(data);
      });
    } catch (e) {
      res.statusCode = 500;
      res.end('server error');
    }
  });
}

(function main(){
  const opt = parseArgs();
  const root = path.resolve(opt.dir || 'docs');
  if (!fs.existsSync(root)) {
    console.error('[serve] directory not found:', root);
    process.exit(1);
  }
  const server = serve(root);
  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      // fallback to random port
      const tmp = serve(root);
      tmp.listen(0, () => {
        const p = tmp.address().port;
        console.log(`[serve] port in use, using http://localhost:${p}`);
      });
      return;
    }
    console.error('[serve] error:', err);
    process.exit(1);
  });
  server.listen(opt.port, () => {
    const addr = server.address();
    console.log(`[serve] serving ${root} at http://localhost:${addr.port}`);
    console.log('[serve] try:');
    console.log(` - http://localhost:${addr.port}/`);
    console.log(` - http://localhost:${addr.port}/test/water-cld.html`);
  });
})();

