E2E (lightweight) with puppeteer-core

Prereqs
- Install dev deps once: puppeteer-core and http-server (no Chromium download).
- Use a system browser (Chrome/Edge) via PUPPETEER_EXECUTABLE_PATH.

Quick run (PowerShell)
- $env:PUPPETEER_EXECUTABLE_PATH="C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
- $env:REL="/water/cld/index.html"; npm run e2e:render; Remove-Item Env:REL
- Remove-Item Env:PUPPETEER_EXECUTABLE_PATH

Linux/macOS examples
- export PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
- REL=/water/cld/index.html npm run e2e:render

