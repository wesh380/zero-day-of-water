(function(){
  const containers = document.querySelectorAll('[data-mobile-actions-container]');
  if(!containers.length) return;

  const SVG_NS = 'http://www.w3.org/2000/svg';

  function makeChevronLeft(){
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox','0 0 24 24');
    svg.setAttribute('width','20');
    svg.setAttribute('height','20');
    svg.setAttribute('aria-hidden','true');
    svg.setAttribute('focusable','false');
    svg.classList.add('mobile-actions__trigger-icon');
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('fill','currentColor');
    path.setAttribute('d','M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z');
    svg.appendChild(path);
    return svg;
  }

  let partialPromise;
  let partialErrorLogged = false;
  const logPartialIssue = ()=>{
    if(partialErrorLogged) return;
    partialErrorLogged = true;
    console.warn('mobile-actions: unable to load partial, using fallback');
  };

  const loadPartial = ()=>{
    if(!partialPromise){
      partialPromise = (async ()=>{
        try{
          const response = await fetch('/assets/partials/mobile-actions.html', { credentials: 'same-origin' });
          if(!response.ok){
            logPartialIssue();
            return null;
          }
          const text = await response.text();
          if(!text.trim()){
            logPartialIssue();
            return null;
          }
          return text;
        }catch{
          logPartialIssue();
          return null;
        }
      })();
    }
    return partialPromise;
  };

  const createFallback = ()=>{
    const wrapper = document.createElement('div');
    wrapper.className = 'mobile-actions';
    wrapper.setAttribute('data-mobile-actions-root', '');

    const trigger = document.createElement('button');
    trigger.id = 'mobileActionsBtn';
    trigger.className = 'mobile-actions__trigger';
    trigger.type = 'button';
    trigger.setAttribute('aria-controls', 'mobileActions');
    trigger.setAttribute('aria-expanded', 'false');

    const label = document.createElement('span');
    label.className = 'mobile-actions__trigger-label';
    label.textContent = 'منوی ناوبری';

    trigger.appendChild(label);
    trigger.appendChild(makeChevronLeft());

    const panel = document.createElement('div');
    panel.id = 'mobileActions';
    panel.className = 'mobile-actions__popover';
    panel.hidden = true;

    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'منوی موبایل');

    const list = document.createElement('ul');
    list.className = 'mobile-actions__list';
    list.setAttribute('data-mobile-actions-list', '');

    nav.appendChild(list);
    panel.appendChild(nav);

    wrapper.appendChild(trigger);
    wrapper.appendChild(panel);

    return wrapper;
  };

  const copyLinkAttributes = (source, target)=>{
    ['href','title','aria-label','aria-current','target','rel'].forEach((attr)=>{
      if(source.hasAttribute(attr)){
        target.setAttribute(attr, source.getAttribute(attr));
      }
    });
  };

  const populateLinks = (root, container)=>{
    const list = root.querySelector('[data-mobile-actions-list]');
    if(!list) return;
    const header = container.closest('header');
    const sourceNav = header ? header.querySelector('[data-mobile-actions-source]') : document.querySelector('[data-mobile-actions-source]');
    if(!sourceNav) return;

    const links = sourceNav.querySelectorAll('a[href]');
    list.innerHTML = '';
    links.forEach((link)=>{
      const item = document.createElement('li');
      item.className = 'mobile-actions__item';
      const anchor = document.createElement('a');
      anchor.className = 'mobile-actions__link';
      anchor.innerHTML = link.innerHTML;
      copyLinkAttributes(link, anchor);
      item.appendChild(anchor);
      list.appendChild(item);
    });
  };

  containers.forEach((container)=>{
    loadPartial().then((html)=>{
      let root;
      if(html){
        container.innerHTML = html;
        root = container.querySelector('[data-mobile-actions-root]') || container;
      } else {
        const fallback = createFallback();
        container.innerHTML = '';
        container.appendChild(fallback);
        root = fallback;
      }
      populateLinks(root, container);

      const trigger = root.querySelector('#mobileActionsBtn');
      const panel = root.querySelector('#mobileActions');
      if(!trigger || !panel) return;

      const closePanel = (focusTrigger = true)=>{
        if(panel.hidden) return;
        panel.hidden = true;
        trigger.setAttribute('aria-expanded','false');
        if(focusTrigger) trigger.focus();
      };

      const openPanel = ()=>{
        if(!panel.hidden) return;
        panel.hidden = false;
        trigger.setAttribute('aria-expanded','true');
        const firstLink = panel.querySelector('a');
        if(firstLink){
          firstLink.focus();
        }
      };

      trigger.addEventListener('click', ()=>{
        const expanded = trigger.getAttribute('aria-expanded') === 'true';
        if(expanded){
          closePanel(false);
        } else {
          openPanel();
        }
      });

      panel.addEventListener('click', (event)=>{
        const target = event.target.closest('a');
        if(target){
          closePanel(false);
        }
      });

      document.addEventListener('keydown', (event)=>{
        if(event.key === 'Escape' && trigger.getAttribute('aria-expanded') === 'true'){
          event.preventDefault();
          closePanel();
        }
      });
    });
  });
})();
