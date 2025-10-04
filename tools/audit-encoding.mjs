import { promises as fs } from "fs";
import path from "path";

const ROOT = process.cwd();
const DOCS_DIR = path.join(ROOT, "docs");
const REPORT_JSON = path.join(ROOT, "tools", "encoding-audit-report.json");
const REPORT_MD = path.join(ROOT, "tools", "encoding-audit-report.md");

const suspiciousCharRegex = /[ØÙÛÂ�]/g;
const suspiciousStringRegex = /(â€|œ|‹|�)/g;
const letterRegex = /[A-Za-z\u0600-\u06FF]/g;

async function walk(dir, extensions) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await walk(full, extensions);
      results.push(...nested);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (!extensions || extensions.includes(ext)) {
        results.push(full);
      }
    }
  }
  return results;
}

async function readFileSafe(filePath) {
  const buffer = await fs.readFile(filePath);
  let hasBOM = false;
  if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    hasBOM = true;
  }
  const content = buffer.toString("utf8");
  return { content, hasBOM };
}

function analyzeHtml(filePath, content, hasBOM, headersMap, harMap) {
  const lower = content.toLowerCase();
  const htmlTagMatch = content.match(/<html[^>]*>/i);
  const dirRtl = htmlTagMatch ? /dir\s*=\s*"rtl"/i.test(htmlTagMatch[0]) : false;
  const langFa = htmlTagMatch ? /lang\s*=\s*"fa"/i.test(htmlTagMatch[0]) : false;

  const headMatch = content.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const headInner = headMatch ? headMatch[1] : "";

  const metaMatches = headInner.match(/<meta[^>]*>/gi) || [];
  const charsetMetaMatch = headInner.match(/<meta[^>]*charset\s*=\s*"?utf-8"?[^>]*>/i);
  const hasCharsetMeta = Boolean(charsetMetaMatch);
  let charsetMetaIndex = -1;
  if (hasCharsetMeta) {
    const target = charsetMetaMatch[0];
    charsetMetaIndex = metaMatches.findIndex((meta) => meta.toLowerCase() === target.toLowerCase());
    if (charsetMetaIndex === -1) {
      charsetMetaIndex = metaMatches.findIndex((meta) => /charset\s*=\s*"?utf-8"?/i.test(meta));
    }
  }

  const httpEquivMatches = headInner.match(/<meta[^>]*http-equiv\s*=\s*"content-type"[^>]*>/gi) || [];
  const httpEquivDetails = httpEquivMatches.map((meta) => {
    const charsetMatch = meta.match(/charset\s*=\s*([^"'>\s]+)/i);
    return charsetMatch ? charsetMatch[1].toLowerCase() : "";
  });
  const hasHttpEquiv = httpEquivMatches.length > 0;

  const suspiciousChars = content.match(suspiciousCharRegex) || [];
  const suspiciousStrings = content.match(suspiciousStringRegex) || [];
  const mojibakeTokensCount = suspiciousChars.length + suspiciousStrings.length;
  const lettersCount = (content.match(letterRegex) || []).length;
  const mojibakeRatio = lettersCount === 0 ? 0 : mojibakeTokensCount / lettersCount;
  const hasPersian = /[\u0600-\u06FF]/.test(content);

  const statuses = [];
  if (!hasCharsetMeta) {
    statuses.push("WARN_missing_meta");
  }
  if (hasCharsetMeta && charsetMetaIndex > 0) {
    statuses.push("WARN_meta_not_first");
  }
  if (hasHttpEquiv) {
    const conflict = httpEquivDetails.some((value) => value && value !== "utf-8");
    statuses.push(conflict ? "WARN_http_equiv_conflict" : "WARN_http_equiv_present");
  }
  if (mojibakeTokensCount >= 10 || mojibakeRatio > 0.01) {
    statuses.push("SUSPECT_mojibake");
  }
  if (statuses.length === 0) {
    statuses.push("OK");
  }

  const headLines = headInner
    .split(/\r?\n/)
    .slice(0, 20)
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");

  const relPath = path.relative(ROOT, filePath);
  const headerRule = headersMap.get("/" + path.relative(DOCS_DIR, filePath).replace(/\\/g, "/"));
  const harHeader = harMap.get("/" + path.relative(DOCS_DIR, filePath).replace(/\\/g, "/"));

  return {
    path: relPath.replace(/\\/g, "/"),
    type: "html",
    hasCharsetMeta,
    charsetMetaFirst: charsetMetaIndex <= 0,
    charsetMetaIndex,
    hasHttpEquivCT: hasHttpEquiv,
    httpEquivValues: httpEquivDetails,
    hasBOM,
    hasPersian,
    mojibakeTokensCount,
    mojibakeRatio: Number(mojibakeRatio.toFixed(5)),
    rtlLang: { dirRtl, langFa },
    headPreview: headLines,
    status: statuses,
    headerRule: headerRule || null,
    harHeader: harHeader || null,
  };
}

function analyzeCss(filePath, content) {
  const trimmed = content.trimStart();
  const hasAtCharset = /@charset\s+"[^"]+"/i.test(content);
  let atCharsetFirst = true;
  if (hasAtCharset) {
    atCharsetFirst = trimmed.startsWith("@charset");
  }
  const statuses = [];
  if (hasAtCharset && !atCharsetFirst) {
    statuses.push("WARN_atcharset_position");
  }
  if (statuses.length === 0) {
    statuses.push("OK");
  }
  return {
    path: path.relative(ROOT, filePath).replace(/\\/g, "/"),
    type: "css",
    hasAtCharset,
    atCharsetFirst,
    status: statuses,
  };
}

async function parseHeaders() {
  const headersPath = path.join(DOCS_DIR, "_headers");
  const result = { lines: [], risks: [], map: new Map() };
  try {
    const raw = await fs.readFile(headersPath, "utf8");
    const lines = raw.split(/\r?\n/);
    result.lines = lines;
    let currentPath = null;
    for (const line of lines) {
      if (!line.trim()) continue;
      if (!line.startsWith(" ")) {
        currentPath = line.trim();
        continue;
      }
      if (!currentPath) continue;
      const headerMatch = line.trim().match(/^Content-Type:\s*(.+)$/i);
      if (headerMatch) {
        const value = headerMatch[1];
        if (currentPath === "/*") {
          result.risks.push("RISK_ct_global_html");
        }
        if (/charset=/i.test(value) && !/charset\s*=\s*utf-8/i.test(value)) {
          result.risks.push("RISK_non_utf8_charset");
        }
        result.map.set(currentPath, value);
      }
      if (/X-Content-Type-Options:/i.test(line) && !/nosniff/i.test(line)) {
        result.risks.push("RISK_missing_nosniff");
      }
    }
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.warn("Failed to read _headers:", error.message);
    }
  }
  return result;
}

async function parseHarFiles() {
  const harPaths = [];
  const rootFiles = await fs.readdir(ROOT);
  for (const file of rootFiles) {
    if (file.toLowerCase().endsWith(".har")) {
      harPaths.push(path.join(ROOT, file));
    }
  }
  try {
    const toolsEntries = await fs.readdir(path.join(ROOT, "tools"));
    for (const entry of toolsEntries) {
      if (entry.toLowerCase().endsWith(".har")) {
        harPaths.push(path.join(ROOT, "tools", entry));
      }
    }
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.warn("Failed to read tools directory for HAR files:", error.message);
    }
  }

  const map = new Map();
  for (const harPath of harPaths) {
    try {
      const raw = await fs.readFile(harPath, "utf8");
      const data = JSON.parse(raw);
      const entries = data?.log?.entries || [];
      for (const entry of entries) {
        const url = entry?.request?.url || "";
        const contentTypeHeader = entry?.response?.headers?.find((h) => /content-type/i.test(h?.name || ""));
        if (!contentTypeHeader) continue;
        const value = contentTypeHeader.value;
        if (!/text\/html/i.test(value || "")) continue;
        try {
          const { pathname } = new URL(url);
          const localPath = pathname.startsWith("/") ? pathname : "/" + pathname;
          map.set(localPath, value);
        } catch (_) {
          continue;
        }
      }
    } catch (error) {
      console.warn(`Failed to parse HAR ${harPath}:`, error.message);
    }
  }
  return map;
}

function aggregateStatuses(htmlResults) {
  const counts = new Map();
  for (const item of htmlResults) {
    for (const status of item.status) {
      counts.set(status, (counts.get(status) || 0) + 1);
    }
  }
  return counts;
}

function buildMarkdown({ summary, headersInfo, harInfo, suspects, htmlResults, cssResults }) {
  const lines = [];
  lines.push("# Encoding Audit Report");
  lines.push("");
  lines.push("## Summary");
  lines.push(`HTML files scanned: ${summary.html}`);
  lines.push(`CSS files scanned: ${summary.css}`);
  lines.push("Status counts:");
  for (const [status, count] of summary.statusCounts) {
    lines.push(`- ${status}: ${count}`);
  }
  lines.push("");

  lines.push("## Netlify Headers Analysis");
  if (headersInfo.lines.length === 0) {
    lines.push("No docs/_headers file found.");
  } else {
    lines.push("```");
    lines.push(headersInfo.lines.join("\n"));
    lines.push("```");
    if (headersInfo.risks.length) {
      lines.push("Risks:");
      for (const risk of headersInfo.risks) {
        lines.push(`- ${risk}`);
      }
    } else {
      lines.push("No risks detected.");
    }
  }
  lines.push("");

  lines.push("## HAR Headers Summary");
  if (harInfo.size === 0) {
    lines.push("No HAR entries parsed.");
  } else {
    for (const [pathname, value] of harInfo.entries()) {
      lines.push(`- ${pathname}: ${value}`);
    }
  }
  lines.push("");

  lines.push("## Top Suspects");
  if (suspects.length === 0) {
    lines.push("No suspected mojibake issues detected.");
  } else {
    lines.push("Path | Status | Mojibake Tokens | Header Charset");
    lines.push("---|---|---|---");
    for (const item of suspects) {
      const header = item.headerRule || item.harHeader || "";
      lines.push(`${item.path} | ${item.status.join(", ")} | ${item.mojibakeTokensCount} | ${header}`);
    }
  }
  lines.push("");

  lines.push("## Per-file Details (HTML)");
  for (const item of htmlResults) {
    lines.push(`### ${item.path}`);
    lines.push(`- Status: ${item.status.join(", ")}`);
    lines.push(`- hasCharsetMeta: ${item.hasCharsetMeta}`);
    lines.push(`- charsetMetaFirst: ${item.charsetMetaFirst}`);
    lines.push(`- hasHttpEquivCT: ${item.hasHttpEquivCT}`);
    lines.push(`- hasBOM: ${item.hasBOM}`);
    lines.push(`- hasPersian: ${item.hasPersian}`);
    lines.push(`- mojibakeTokensCount: ${item.mojibakeTokensCount}`);
    lines.push(`- mojibakeRatio: ${item.mojibakeRatio}`);
    if (item.headerRule) {
      lines.push(`- Netlify header: ${item.headerRule}`);
    }
    if (item.harHeader) {
      lines.push(`- HAR header: ${item.harHeader}`);
    }
    if (item.headPreview) {
      lines.push("```");
      lines.push(item.headPreview);
      lines.push("```");
    }
    lines.push("");
  }

  if (cssResults.length) {
    lines.push("## CSS Files");
    for (const item of cssResults) {
      lines.push(`- ${item.path}: ${item.status.join(", ")}`);
    }
  }

  return lines.join("\n");
}

async function main() {
  const [headersInfo, harInfo] = await Promise.all([parseHeaders(), parseHarFiles()]);
  if (!(await fs.stat(DOCS_DIR).catch(() => null))) {
    console.error("docs directory not found");
    process.exit(1);
  }

  const htmlFiles = await walk(DOCS_DIR, [".html"]);
  const cssFiles = await walk(DOCS_DIR, [".css"]);

  const headersMap = new Map();
  for (const [route, value] of headersInfo.map.entries()) {
    let normalizedRoute = route;
    if (!normalizedRoute.startsWith("/")) normalizedRoute = "/" + normalizedRoute;
    headersMap.set(normalizedRoute, value);
  }

  const htmlResults = [];
  for (const file of htmlFiles) {
    const { content, hasBOM } = await readFileSafe(file);
    const result = analyzeHtml(file, content, hasBOM, headersMap, harInfo);
    htmlResults.push(result);
  }

  const cssResults = [];
  for (const file of cssFiles) {
    const { content } = await readFileSafe(file);
    cssResults.push(analyzeCss(file, content));
  }

  const statusCounts = aggregateStatuses(htmlResults);
  const summary = {
    html: htmlFiles.length,
    css: cssFiles.length,
    statusCounts,
  };

  const suspects = htmlResults
    .filter((item) => item.status.includes("SUSPECT_mojibake"))
    .sort((a, b) => b.mojibakeTokensCount - a.mojibakeTokensCount)
    .slice(0, 20);

  const jsonReport = [...htmlResults, ...cssResults];
  await fs.writeFile(REPORT_JSON, JSON.stringify(jsonReport, null, 2) + "\n", "utf8");

  const markdown = buildMarkdown({ summary, headersInfo, harInfo, suspects, htmlResults, cssResults });
  await fs.writeFile(REPORT_MD, markdown, "utf8");

  console.log(`HTML scanned: ${summary.html}`);
  console.log(`CSS scanned: ${summary.css}`);
  for (const [status, count] of statusCounts.entries()) {
    console.log(`${status}: ${count}`);
  }
  if (suspects.length) {
    console.log("Top suspects:");
    for (const item of suspects) {
      console.log(` - ${item.path} (tokens: ${item.mojibakeTokensCount}, ratio: ${item.mojibakeRatio})`);
    }
  } else {
    console.log("No suspected mojibake files detected.");
  }

  const risks = new Set(headersInfo.risks);
  if (risks.size) {
    console.log("Header risks:");
    for (const risk of risks) {
      console.log(` - ${risk}`);
    }
  }
  if (harInfo.size) {
    console.log("HAR entries considered:", harInfo.size);
  }
}

main().catch((error) => {
  console.error("Encoding audit failed:", error);
  process.exit(1);
});
