const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 8081;
const BASE_DIR = path.join(__dirname, '../docs');

// Simple static file server
const server = http.createServer((req, res) => {
  let filePath = path.join(BASE_DIR, req.url === '/' ? 'index.html' : req.url);

  // Handle /agrovoltaics/ path which maps to docs/agrovoltaics/index.html
  if (req.url === '/agrovoltaics/' || req.url === '/agrovoltaics') {
    filePath = path.join(BASE_DIR, 'agrovoltaics/index.html');
  } else if (req.url.startsWith('/agrovoltaics/')) {
      // Serve assets relative to agrovoltaics if needed, or fallback
      // But based on file structure, assets are in /assets/
      // The browser requests /assets/... which is /docs/assets/...
      // So standard mapping should work if stripped properly
  }

  const extname = path.extname(filePath);
  let contentType = 'text/html';
  switch (extname) {
    case '.js': contentType = 'text/javascript'; break;
    case '.css': contentType = 'text/css'; break;
    case '.json': contentType = 'application/json'; break;
    case '.png': contentType = 'image/png'; break;
    case '.jpg': contentType = 'image/jpg'; break;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if(err.code == 'ENOENT') {
        res.writeHead(404);
        res.end(`File not found: ${req.url}`);
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);

  // Check if we can fetch the main page
  const checkUrl = `http://localhost:${PORT}/agrovoltaics/`;

  // Basic check: does HTML serve?
  // We can't easily check JS execution with node only without puppeteer,
  // but we can check if the file content includes our safety features.

  // For this smoke test, we'll verify the file exists and has the try/catch block
  // This is a "static" smoke test due to environment limitations.

  const appJsPath = path.join(BASE_DIR, 'solar/agrivoltaics/app.js');
  fs.readFile(appJsPath, 'utf8', (err, data) => {
     if (err) {
         console.error("FAIL: app.js not found");
         process.exit(1);
     }

     if (data.includes('try {') && data.includes('ReactDOM.createRoot') && data.includes('catch (err)')) {
         console.log("PASS: app.js contains error handling air-bag.");
     } else {
         console.error("FAIL: app.js missing error handling block.");
         process.exit(1);
     }

     // Verify overrides.css link in HTML
     const htmlPath = path.join(BASE_DIR, 'agrovoltaics/index.html');
     fs.readFile(htmlPath, 'utf8', (err, html) => {
        if (err) {
             console.error("FAIL: index.html not found");
             process.exit(1);
        }
        if (html.includes('overrides.css') && html.includes('agri-calculator-shell')) {
             console.log("PASS: index.html contains layout fixes.");
             server.close();
             process.exit(0);
        } else {
             console.error("FAIL: index.html missing layout fixes.");
             process.exit(1);
        }
     });
  });
});
