(function () {
  const FALLBACK_MOJI_RE = /[\u00D8\u00D9\u00C2\u00C3]|(?:\u00C3\u00A2)|(?:\u00E2\u20AC)/;
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

  function fallbackNeedsFix(value) {
    return typeof value === "string" && FALLBACK_MOJI_RE.test(value);
  }

  function fallbackLatin1ToUtf8(value) {
    if (!value) {
      return value;
    }
    const bytes = new Uint8Array(value.length);
    for (let i = 0; i < value.length; i += 1) {
      const code = value.charCodeAt(i);
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
      return value;
    }
  }

  function bootstrap(helpers) {
    const needsFix = helpers?.needsFix || fallbackNeedsFix;
    const latin1ToUtf8 = helpers?.latin1ToUtf8 || fallbackLatin1ToUtf8;

    function fixTextNode(node) {
      const text = node && node.nodeValue;
      if (typeof text === "string" && needsFix(text)) {
        const converted = latin1ToUtf8(text);
        if (converted !== text) {
          node.nodeValue = converted;
        }
      }
    }

    function fixElementText(element) {
      if (!element || typeof element.textContent !== "string") {
        return;
      }
      const current = element.textContent;
      if (needsFix(current)) {
        const converted = latin1ToUtf8(current);
        if (converted !== current) {
          element.textContent = converted;
        }
      }
    }

    function scanDom(root) {
      if (!root) {
        return;
      }
      if (root.nodeType === Node.TEXT_NODE) {
        fixTextNode(root);
        return;
      }
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const queue = [];
      let current;
      while ((current = walker.nextNode())) {
        if (needsFix(current.nodeValue)) {
          queue.push(current);
        }
      }
      queue.forEach(fixTextNode);

      if (root.querySelectorAll) {
        root
          .querySelectorAll("option,button,summary,.badge,.pill,[data-label]")
          .forEach(fixElementText);
      }
    }

    function run() {
      if (document && document.body) {
        scanDom(document.body);
      }
      const title = document?.title;
      if (typeof title === "string" && needsFix(title)) {
        const converted = latin1ToUtf8(title);
        if (converted !== title) {
          document.title = converted;
        }
      }
      if (document && document.body) {
        const observer = new MutationObserver(mutations => {
          for (const mutation of mutations) {
            if (mutation.type === "characterData") {
              fixTextNode(mutation.target);
            }
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
              mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) {
                  fixTextNode(node);
                } else {
                  scanDom(node);
                }
              });
            }
          }
        });
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          characterData: true
        });
      }
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", run, { once: true });
    } else {
      run();
    }
  }

  import("/assets/js/encoding.js")
    .then(bootstrap)
    .catch(() => {
      bootstrap({ needsFix: fallbackNeedsFix, latin1ToUtf8: fallbackLatin1ToUtf8 });
    });
})();
