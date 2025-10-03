import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const docsRoot = path.join(repoRoot, "docs");

const routes = [
  "/index.html",
  "/electricity/",
  "/water/hub/",
  "/solar/agrivoltaics/",
];

async function fileExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function sanitizeUrl(value) {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  const [withoutHash] = trimmed.split("#");
  const [clean] = withoutHash.split("?");
  return clean.trim();
}

function isExternal(url) {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(url);
}

function isInsideDocs(targetPath) {
  const relative = path.relative(docsRoot, targetPath);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

async function resolveHtmlPath(route) {
  const normalized = route.startsWith("/") ? route.slice(1) : route;

  if (!normalized || normalized.endsWith("/")) {
    const base = normalized.replace(/\/$/, "");
    const dirPath = path.join(docsRoot, base);
    const indexCandidate = path.join(dirPath, "index.html");
    if (await fileExists(indexCandidate)) {
      return indexCandidate;
    }
    const fallback = `${base ? base + "." : ""}html`;
    const fallbackPath = path.join(docsRoot, fallback);
    if (await fileExists(fallbackPath)) {
      return fallbackPath;
    }
    return null;
  }

  const directPath = path.join(docsRoot, normalized);
  if (await fileExists(directPath)) {
    return directPath;
  }
  return null;
}

async function collectAssets(htmlPath) {
  const html = await fs.readFile(htmlPath, "utf8");
  const assets = new Set();

  const linkRegex = /<link\b[^>]*href\s*=\s*(["'])([^"']+)\1/gi;
  const scriptRegex = /<script\b[^>]*src\s*=\s*(["'])([^"']+)\1/gi;

  for (const match of html.matchAll(linkRegex)) {
    assets.add(match[2]);
  }

  for (const match of html.matchAll(scriptRegex)) {
    assets.add(match[2]);
  }

  return [...assets];
}

function resolveAssetPath(htmlPath, assetUrl) {
  const cleanUrl = sanitizeUrl(assetUrl);
  if (!cleanUrl || cleanUrl.startsWith("#") || isExternal(cleanUrl)) {
    return null;
  }

  if (cleanUrl.startsWith("/")) {
    return path.join(docsRoot, cleanUrl.slice(1));
  }

  const htmlDir = path.dirname(htmlPath);
  return path.resolve(htmlDir, cleanUrl);
}

async function main() {
  const failures = [];

  for (const route of routes) {
    const htmlPath = await resolveHtmlPath(route);

    if (!htmlPath) {
      failures.push({
        route,
        asset: "(page)",
        detail: "Page not found inside docs/",
      });
      continue;
    }

    const assets = await collectAssets(htmlPath);

    for (const assetUrl of assets) {
      const resolved = resolveAssetPath(htmlPath, assetUrl);
      if (!resolved) {
        continue;
      }

      if (!isInsideDocs(resolved)) {
        failures.push({
          route,
          asset: assetUrl,
          detail: "Resolves outside docs/",
        });
        continue;
      }

      if (!(await fileExists(resolved))) {
        failures.push({
          route,
          asset: assetUrl,
          detail: `Missing file: ${path.relative(repoRoot, resolved)}`,
        });
      }
    }
  }

  if (failures.length === 0) {
    console.log("All linked assets resolved.");
    return;
  }

  console.log("Broken asset references found:");
  for (const failure of failures) {
    console.log(`- ${failure.route} -> ${failure.asset} (${failure.detail})`);
  }
  process.exitCode = 1;
}

main().catch((error) => {
  console.error("Asset audit failed:", error);
  process.exitCode = 1;
});

