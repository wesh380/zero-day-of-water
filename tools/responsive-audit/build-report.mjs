#!/usr/bin/env node
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';

import {
  getAuditDate,
  resolveOutputDir,
  REPORT_PATHS,
  FINDINGS_FILENAME,
  SUMMARY_FILENAME,
  OUTPUT_BASE_DIR,
  LATEST_MARKER
} from './config.mjs';

const args = process.argv.slice(2);
const dateArg = args.find((arg) => arg.startsWith('--date='))?.split('=')[1];

async function readLatestMarker() {
  try {
    const markerPath = path.join(process.cwd(), OUTPUT_BASE_DIR, LATEST_MARKER);
    const content = await readFile(markerPath, 'utf8');
    const data = JSON.parse(content);
    return data.date;
  } catch (error) {
    return null;
  }
}

function severityWeight(severity) {
  switch (severity) {
    case 'P1':
      return 4;
    case 'P2':
      return 3;
    case 'P3':
      return 2;
    default:
      return 1;
  }
}

function effortForSeverity(severity) {
  switch (severity) {
    case 'P1':
      return 'L';
    case 'P2':
      return 'M';
    case 'P3':
      return 'S';
    default:
      return 'XS';
  }
}

function ownerForIssueType(issueType) {
  if (issueType.startsWith('axe:')) return 'Accessibility';
  if (issueType.includes('image')) return 'Frontend';
  if (issueType.includes('rtl')) return 'Localization';
  return 'Frontend';
}

async function loadFindings(date) {
  const outputRoot = resolveOutputDir(date);
  const reportsDir = path.join(process.cwd(), outputRoot, REPORT_PATHS.reports);
  const findingsPath = path.join(reportsDir, FINDINGS_FILENAME);
  const summaryPath = path.join(reportsDir, SUMMARY_FILENAME);
  const [findingsRaw, summaryRaw] = await Promise.all([
    readFile(findingsPath, 'utf8'),
    readFile(summaryPath, 'utf8')
  ]);
  const findingsData = JSON.parse(findingsRaw);
  const summary = JSON.parse(summaryRaw);
  return { findingsData, summary, outputRoot };
}

async function walkScreenshots(dir, base) {
  const entries = [];
  let items;
  try {
    items = await readdir(dir, { withFileTypes: true });
  } catch (error) {
    return entries;
  }
  for (const item of items) {
    const itemPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      entries.push(...(await walkScreenshots(itemPath, base)));
    } else if (item.isFile() && item.name.endsWith('.png')) {
      entries.push(path.relative(base, itemPath));
    }
  }
  return entries;
}

function formatMarkdownTable(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const lines = [];
  lines.push(`| ${headers.join(' | ')} |`);
  lines.push(`| ${headers.map(() => '---').join(' | ')} |`);
  for (const row of rows) {
    lines.push(`| ${headers.map((h) => String(row[h] ?? '')).join(' | ')} |`);
  }
  return lines.join('\n');
}

function generateBacklogRows(findings) {
  const sorted = [...findings].sort((a, b) => severityWeight(b.severity) - severityWeight(a.severity));
  return sorted.slice(0, Math.min(200, sorted.length)).map((finding) => ({
    Page: finding.page,
    Browser: finding.browser,
    Viewport: finding.viewport,
    Mode: `${finding.theme}/${finding.language}/${finding.zoom}x/${finding.motion}`,
    Selector: finding.selector,
    IssueType: finding.issueType,
    Severity: finding.severity,
    Evidence: finding.evidence,
    SuggestedFix: finding.suggestedFix,
    Owner: ownerForIssueType(finding.issueType),
    Effort: effortForSeverity(finding.severity)
  }));
}

function summarizeTopIssues(findings) {
  const counts = new Map();
  for (const finding of findings) {
    counts.set(finding.issueType, (counts.get(finding.issueType) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([type, count]) => `- ${type}: ${count} findings`)
    .join('\n');
}

function summarizeRiskyComponents(findings) {
  const components = new Map();
  for (const finding of findings) {
    const key = `${finding.selector}|${finding.page}`;
    components.set(key, (components.get(key) ?? 0) + severityWeight(finding.severity));
  }
  return Array.from(components.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key, score]) => {
      const [selector, page] = key.split('|');
      return `- ${selector} on ${page} (risk score ${score})`;
    })
    .join('\n');
}

function buildMarkdown(summary, findings) {
  const backlogRows = generateBacklogRows(findings);
  const backlogTable = formatMarkdownTable(backlogRows);
  const topIssues = summarizeTopIssues(findings);
  const riskyComponents = summarizeRiskyComponents(findings);
  return `# Responsive Audit Summary\\n\\n` +
    `- **Audit date:** ${summary.auditDate}\\n` +
    `- **Pages covered:** ${summary.totalPages}\\n` +
    `- **Scenarios executed:** ${summary.totalScenarios}\\n` +
    `- **Severity counts:** P1=${summary.severityCounts.P1}, P2=${summary.severityCounts.P2}, P3=${summary.severityCounts.P3}, P4=${summary.severityCounts.P4}\\n` +
    `- **Pages with P1 issues:** ${summary.pagesWithP1.length}\\n` +
    `- **Lighthouse pages:** ${summary.lighthouse.length}\\n\\n` +
    `## Top recurring issues\\n${topIssues || 'No issues detected.'}\\n\\n` +
    `## High risk components\\n${riskyComponents || 'No high risk components detected.'}\\n\\n` +
    `## Backlog\\n${backlogTable || 'No findings available.'}\\n`;
}

function buildIndexHtml(screenshotPaths) {
  const items = screenshotPaths
    .sort()
    .map((relativePath) => {
      const parts = relativePath.split(path.sep);
      const fileName = parts[parts.length - 1];
      const webPath = ['.', ...parts].join('/');
      return `<figure class="shot"><img src="${webPath}" alt="${fileName}"><figcaption>${parts.join(' / ')}</figcaption></figure>`;
    })
    .join('\n');
  return `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>Responsive Audit Gallery</title>\n<style>body{font-family:system-ui,sans-serif;margin:0;padding:1rem;background:#f5f5f5}h1{margin-bottom:1rem}main{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:1rem}figure{background:#fff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.1);padding:0.5rem}figure img{width:100%;height:auto;border-radius:4px}figcaption{margin-top:0.5rem;font-size:0.85rem;word-break:break-word}</style>\n</head>\n<body>\n<h1>Responsive Audit Gallery</h1>\n<main>${items}</main>\n</body>\n</html>`;
}

async function main() {
  const effectiveDate = dateArg || (await readLatestMarker()) || getAuditDate();
  const { findingsData, summary, outputRoot } = await loadFindings(effectiveDate);
  const markdown = buildMarkdown(summary, findingsData.findings ?? []);
  const reportsDir = path.join(process.cwd(), outputRoot, REPORT_PATHS.reports);
  await mkdir(reportsDir, { recursive: true });
  const markdownPath = path.join(reportsDir, 'responsive-findings.md');
  await writeFile(markdownPath, markdown, 'utf8');

  const screenshotRoot = path.join(process.cwd(), outputRoot, REPORT_PATHS.screenshots);
  const screenshotPaths = await walkScreenshots(screenshotRoot, path.join(process.cwd(), outputRoot));
  const indexHtml = buildIndexHtml(screenshotPaths);
  const indexPath = path.join(process.cwd(), outputRoot, 'index.html');
  await writeFile(indexPath, indexHtml, 'utf8');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
