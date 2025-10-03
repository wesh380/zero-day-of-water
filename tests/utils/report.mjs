import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const REPORT_ROOT = resolve(process.cwd(), 'docs/dev/reports/responsive');

const ensureDir = async (dir) => {
  await mkdir(dir, { recursive: true });
  return dir;
};

const stampRun = () => new Date().toISOString().replace(/[:.]/g, '-');

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const renderHtml = (payload) => {
  const sections = payload.pages.map((page) => {
    const items = page.results.map((result) => {
      const offenderSummary = result.offenders && result.offenders.length
        ? `<details><summary>Overflow offenders</summary><pre>${escapeHtml(JSON.stringify(result.offenders, null, 2))}</pre></details>`
        : '';
      const thumb = result.screenshot
        ? `<a href="${result.screenshot}"><img src="${result.screenshot}" alt="${escapeHtml(page.url)} ${result.viewport.width}x${result.viewport.height}" width="320"></a>`
        : '';
      const dataLink = result.json ? ` (<a href="${result.json}">json</a>)` : '';
      return `<li><strong>${result.viewport.width}x${result.viewport.height}</strong> - ${result.overflow ? 'FAIL' : 'PASS'}${dataLink}${thumb}${offenderSummary}</li>`;
    }).join('\n');
    return `<section><h2>${escapeHtml(page.url)}</h2><ul>${items}</ul></section>`;
  }).join('\n');

  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Responsive Audit ${payload.runId}</title></head><body><h1>Responsive Audit ${payload.runId}</h1><p>Generated at ${escapeHtml(payload.generatedAt)}</p>${sections}</body></html>`;
};

class ReportWriter {
  constructor(runDir, stamp) {
    this.runDir = runDir;
    this.stamp = stamp;
  }

  get id() {
    return this.stamp;
  }

  async ensurePageDir(pageSafeName) {
    return ensureDir(join(this.runDir, pageSafeName));
  }

  async artifactPaths(pageSafeName, viewportLabel) {
    const pageDir = await this.ensurePageDir(pageSafeName);
    const screenshotPath = join(pageDir, `${viewportLabel}.png`);
    const jsonPath = join(pageDir, `${viewportLabel}.json`);
    return {
      screenshotPath,
      jsonPath,
      relativeScreenshot: `${pageSafeName}/${viewportLabel}.png`,
      relativeJson: `${pageSafeName}/${viewportLabel}.json`,
    };
  }

  async writeSummary(pages) {
    const payload = {
      runId: this.stamp,
      generatedAt: new Date().toISOString(),
      pages,
    };
    await writeFile(join(this.runDir, 'summary.json'), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
    await writeFile(join(this.runDir, 'index.html'), `${renderHtml(payload)}\n`, 'utf8');
    return payload;
  }
}

export const createReportWriter = async () => {
  const stamp = stampRun();
  const runDir = await ensureDir(resolve(REPORT_ROOT, stamp));
  return new ReportWriter(runDir, stamp);
};

export const reportRoot = REPORT_ROOT;
