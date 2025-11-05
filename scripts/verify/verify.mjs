import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import http from "http";
import { ensureDir } from "fs-extra";
import puppeteer from "puppeteer";
import { setTimeout as delay } from "timers/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../../");
const docsDir = path.join(rootDir, "docs");
const ART = process.env.ARTIFACT_DIR || ".verify-artifacts";
const artifactsDir = path.join(rootDir, ART);
const shotDir = path.join(artifactsDir, "screenshots");
const reportPath = path.join(artifactsDir, "report-responsive.json");

const PORT = process.env.VERIFY_PORT ? Number(process.env.VERIFY_PORT) : 9099;
const HOST = process.env.VERIFY_HOST || "127.0.0.1";
const BASE = process.env.BASE_URL || `http://${HOST}:${PORT}`;

const ALL_VIEWS = [
  { name: "320", w: 320, h: 844 },
  { name: "390", w: 390, h: 844 },
  { name: "414", w: 414, h: 896 },
  { name: "768", w: 768, h: 1024 },
  { name: "1024", w: 1024, h: 768 },
  { name: "1280", w: 1280, h: 800 },
  { name: "1440", w: 1440, h: 900 },
];
const VIEWS = process.env.SMOKE ? ALL_VIEWS.slice(0, 3) : ALL_VIEWS;

const NAV_TIMEOUT = 15000; // 15s
const STEP_TIMEOUT = 8000; // generic per-step guard

const PAGES = [
  "/index.html",
  "/water/hub.html",
  "/water/insights.html",
  "/gas/index.html",
  "/solar/index.html",
  "/solar/agrivoltaics/index.html",
  "/environment/index.html",
  "/contact/index.html",
  "/test/water-cld.html",
];

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function pageName(url) {
  const clean = url.replace(/\?.*$/, "").replace(/\#.*/, "").replace(/^\//, "");
  return (clean || "home").replace(/[^a-z0-9]+/gi, "-");
}

async function fileExists(p) {
  try {
    await fs.promises.access(p, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function serveDocs() {
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, `${BASE}`);
      let pathname = decodeURIComponent(url.pathname);
      if (pathname.endsWith("/")) pathname += "index.html";
      if (pathname === "/") pathname = "/index.html";
      let filePath = path.join(docsDir, pathname);
      if (!filePath.startsWith(docsDir)) {
        res.statusCode = 403;
        res.end("Forbidden");
        return;
      }
      const exists = await fileExists(filePath);
      if (!exists) {
        res.statusCode = 404;
        res.end("Not Found");
        return;
      }
      const data = await fs.promises.readFile(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const type = MIME_TYPES[ext] || "application/octet-stream";
      res.setHeader("Content-Type", type);
      res.statusCode = 200;
      res.end(data);
    } catch (err) {
      res.statusCode = 500;
      res.end("Internal Server Error");
      console.error("[server] error", err);
    }
  });

  return new Promise((resolve, reject) => {
    server.on("error", reject);
    server.listen(PORT, HOST, () => resolve(server));
  });
}

async function isServerAlive() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${BASE}/index.html`, { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

async function startServerIfNeeded() {
  const alive = await isServerAlive();
  if (alive) return null;
  try {
    const server = await serveDocs();
    console.log(`[verify] started docs server on ${HOST}:${PORT}`);
    return server;
  } catch (err) {
    console.error("[verify] failed to start server", err);
    throw err;
  }
}

async function stopServer(server) {
  if (!server) return;
  return new Promise((resolve) => server.close(resolve));
}

async function settle(page) {
  // bounded settle: wait a bit for fonts/images without hanging
  const maxWait = 3000;
  const start = Date.now();
  try {
    await page.evaluate(() => document.fonts?.ready ?? Promise.resolve());
  } catch {}
  while (Date.now() - start < maxWait) {
    await delay(200);
  }
}

(async () => {
  await ensureDir(shotDir);
  const server = await startServerIfNeeded();
  const browser = await puppeteer.launch({ headless: "new", defaultViewport: null, args: ["--no-sandbox", "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"] });

  const results = {
    generatedAt: new Date().toISOString(),
    base: BASE,
    pages: [],
  };

  try {
    for (const url of PAGES) {
      const name = pageName(url);
      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(NAV_TIMEOUT);
      page.setDefaultTimeout(STEP_TIMEOUT);

      await page.setRequestInterception(true);
      page.on("request", (req) => {
        const target = req.url();
        if (target.startsWith(BASE) || target.startsWith("data:") || target.startsWith("blob:")) {
          return req.continue();
        }
        return req.abort();
      });

      const logs = [];
      page.on("console", (msg) => logs.push({ type: msg.type(), text: msg.text() }));
      page.on("pageerror", (err) => logs.push({ type: "pageerror", text: err.message }));

      await page.evaluateOnNewDocument(() => {
        window.__CLS = 0;
        window.__CLS_ENTRIES = [];
        try {
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.hadRecentInput) continue;
              window.__CLS += entry.value;
              window.__CLS_ENTRIES.push({
                value: entry.value,
                sources: (entry.sources || []).map((s) => {
                  try {
                    if (s.node && typeof s.node.outerHTML === "string") {
                      return s.node.outerHTML.slice(0, 120);
                    }
                  } catch {}
                  return s.node && s.node.nodeName ? s.node.nodeName : "";
                }),
              });
            }
          }).observe({ type: "layout-shift", buffered: true });
        } catch {}
      });

      const pageEntry = {
        url,
        fullUrl: `${BASE}${url}`,
        name,
        viewports: [],
        logs,
      };

      for (const v of VIEWS) {
        console.log(`[verify] viewport ${name} @${v.name}`);
        await page.setViewport({ width: v.w, height: v.h, deviceScaleFactor: 1 });
        const shotPath = path.join(shotDir, `${name}-${v.name}.png`);

        try {
          await page.goto(`${BASE}${url}`, { waitUntil: "domcontentloaded" });
        } catch (err) {
          console.error(`[verify] navigation failed for ${url} at ${v.name}`, err.message);
          pageEntry.viewports.push({
            viewport: v,
            error: err.message,
            screenshot: null,
          });
          continue;
        }

        await settle(page);

        await page
          .waitForSelector("header .site-topbar__brand img, picture.site-topbar__brand img", { timeout: 5000 })
          .catch(() => {});

        const metrics = await page.evaluate(() => {
          const doc = document.documentElement;
          const body = document.body;
          const scrollWidth = doc ? doc.scrollWidth : 0;
          const scrollHeight = doc ? doc.scrollHeight : 0;
          const clientWidth = doc ? doc.clientWidth : 0;
          const clientHeight = doc ? doc.clientHeight : 0;
          const overflowX = scrollWidth > clientWidth + 1;
          const overflowY = scrollHeight > clientHeight + 1;
          return {
            title: document.title,
            cls: typeof window.__CLS === "number" ? Number(window.__CLS.toFixed(5)) : 0,
            overflowX,
            overflowY,
            scrollWidth,
            scrollHeight,
            clientWidth,
            clientHeight,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
          };
        });

        await page.screenshot({ path: shotPath });

        pageEntry.viewports.push({
          viewport: v,
          metrics,
          screenshot: path.relative(rootDir, shotPath).replace(/\\/g, "/"),
        });
      }

      console.log(`[verify] finished ${name}`);

      await page.close();
      results.pages.push(pageEntry);
    }
  } catch (err) {
    console.error("[verify] error", err);
    throw err;
  } finally {
    await browser.close();
    await stopServer(server);
  }

  await ensureDir(path.dirname(reportPath));
  await fs.promises.writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");
  console.log(`[verify] screenshots saved to ${path.relative(rootDir, shotDir)}`);
  console.log(`[verify] report saved to ${path.relative(rootDir, reportPath)}`);
})().catch((err) => {
  console.error("[verify] fatal", err);
  process.exitCode = 1;
});
