(function () {
  const RE = /[\u00D8\u00D9\u00C2\u00C3]|(?:\u00C3\u00A2)|(?:\u00E2\u20AC)/;

  function needsFix(value) {
    return typeof value === 'string' && RE.test(value);
  }

  function latin1ToUtf8(value) {
    if (!value) {
      return value;
    }
    const bytes = new Uint8Array(Array.from(value, (ch) => ch.charCodeAt(0) & 0xff));
    try {
      return new TextDecoder('utf-8').decode(bytes);
    } catch (error) {
      return value;
    }
  }

  function fixTextNode(node) {
    const text = node.nodeValue;
    if (needsFix(text)) {
      node.nodeValue = latin1ToUtf8(text);
    }
  }

  function scanDom(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const queue = [];
    let current;
    while ((current = walker.nextNode())) {
      if (needsFix(current.nodeValue)) {
        queue.push(current);
      }
    }
    queue.forEach(fixTextNode);

    document
      .querySelectorAll('option,button,summary,.badge,.pill,[data-label]')
      .forEach((element) => {
        const text = element.textContent;
        if (needsFix(text)) {
          element.textContent = latin1ToUtf8(text);
        }
      });
  }

  document.addEventListener(
    'DOMContentLoaded',
    () => {
      if (document && document.body) {
        scanDom(document.body);
      }
      const title = document.title;
      if (needsFix(title)) {
        document.title = latin1ToUtf8(title);
      }
    },
    { once: true }
  );
})();
