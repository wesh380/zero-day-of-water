#!/usr/bin/env node

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

let cheerio;
try {
  cheerio = require('cheerio');
} catch (e) {
  // Cheerio not installed; will fall back to regex parsing
}

(async () => {
  try {
    const res = await fetch('https://wesh360.ir/test/water-cld');
    const html = await res.text();

    let inlineScripts = 0;
    let hasMetaCSP = false;

    if (cheerio) {
      const $ = cheerio.load(html);
      inlineScripts = $('script:not([src])').length;
      hasMetaCSP = $('meta[http-equiv="Content-Security-Policy"]').length > 0;
    } else {
      const scriptRegex = /<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi;
      inlineScripts = (html.match(scriptRegex) || []).length;
      const metaRegex = /<meta[^>]+http-equiv=["']Content-Security-Policy["'][^>]*>/i;
      hasMetaCSP = metaRegex.test(html);
    }

    console.log(JSON.stringify({ inlineScripts, hasMetaCSP }));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

