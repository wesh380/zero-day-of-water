const CP1252_REVERSE = new Map([
  [0x20AC, 0x80],
  [0x201A, 0x82],
  [0x0192, 0x83],
  [0x201E, 0x84],
  [0x2026, 0x85],
  [0x2020, 0x86],
  [0x2021, 0x87],
  [0x02C6, 0x88],
  [0x2030, 0x89],
  [0x0160, 0x8A],
  [0x2039, 0x8B],
  [0x0152, 0x8C],
  [0x017D, 0x8E],
  [0x2018, 0x91],
  [0x2019, 0x92],
  [0x201C, 0x93],
  [0x201D, 0x94],
  [0x2022, 0x95],
  [0x2013, 0x96],
  [0x2014, 0x97],
  [0x02DC, 0x98],
  [0x2122, 0x99],
  [0x0161, 0x9A],
  [0x203A, 0x9B],
  [0x0153, 0x9C],
  [0x017E, 0x9E],
  [0x0178, 0x9F]
]);
const UTF8_DECODER = new TextDecoder("utf-8");

export const MOJI_RE = /[\u00D8\u00D9\u00C2\u00C3]|(?:\u00C3\u00A2)|(?:\u00E2\u20AC)/;

export function needsFix(s) {
  return typeof s === "string" && MOJI_RE.test(s);
}

export function latin1ToUtf8(s) {
  if (!s) return s;
  const bytes = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i += 1) {
    const code = s.charCodeAt(i);
    if (code <= 0xff) {
      bytes[i] = code;
    } else if (CP1252_REVERSE.has(code)) {
      bytes[i] = CP1252_REVERSE.get(code);
    } else {
      bytes[i] = code & 0xff;
    }
  }
  try {
    return UTF8_DECODER.decode(bytes);
  } catch (error) {
    return s;
  }
}

export function fixTitles(obj) {
  if (!obj || typeof obj !== "object") return obj;
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (value && typeof value === "object") {
      if (typeof value.title === "string" && needsFix(value.title)) {
        value.title = latin1ToUtf8(value.title);
      }
      if (typeof value.label === "string" && needsFix(value.label)) {
        value.label = latin1ToUtf8(value.label);
      }
    }
  }
  return obj;
}
