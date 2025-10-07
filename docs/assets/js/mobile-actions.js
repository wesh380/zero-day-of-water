(function(){
  const containers = document.querySelectorAll('[data-mobile-actions-container]');
  if(!containers.length) return;

  const ICON_CHEVRON_LEFT = '<svg class="mobile-actions__trigger-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M15 19l-7-7 7-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  let partialPromise;
  const loadPartial = ()=>{
    if(!partialPromise){
      partialPromise = (async ()=>{
        try{
          const response = await fetch('/assets/partials/mobile-actions.html', { credentials: 'same-origin' });
          if(!response.ok) return null;
          return await response.text();
        }catch{
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
    wrapper.innerHTML = [
      '<button id="mobileActionsBtn" class="mobile-actions__trigger" type="button" aria-controls="mobileActions" aria-expanded="false">',
        '<span class="mobile-actions__trigger-label">منوی ناوبری</span>',
        ICON_CHEVRON_LEFT,
      '</button>',
      '<div id="mobileActions" class="mobile-actions__popover" hidden>',
        '<nav aria-label="منوی موبایل">',
          '<ul class="mobile-actions__list" data-mobile-actions-list></ul>',
        '</nav>',
      '</div>'
    ].join('');
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
