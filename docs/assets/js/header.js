(function(){
  const HEADER_ID = 'site-header';
  const PARTIAL_URL = '/assets/partials/header.html';
  const supportsMatchMedia = typeof window.matchMedia === 'function';
  const DESKTOP_MEDIA = supportsMatchMedia ? window.matchMedia('(min-width: 1024px)') : null;

  const isDesktop = ()=> DESKTOP_MEDIA ? DESKTOP_MEDIA.matches : window.innerWidth >= 1024;

  const placeHeader = (header, existing)=>{
    const body = document.body;
    if(!body || !header){
      return null;
    }

    if(existing && existing !== header){
      existing.replaceWith(header);
      return header;
    }

    const skipLink = body.querySelector('.skip-link');
    if(skipLink && skipLink.parentNode === body){
      body.insertBefore(header, skipLink.nextSibling);
    } else {
      body.insertBefore(header, body.firstChild);
    }
    return header;
  };

  const createHeaderFromHTML = (html)=>{
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    const headerEl = template.content.querySelector('header');
    if(!headerEl){
      return null;
    }
    return headerEl.cloneNode(true);
  };

  const closeMenu = (header, toggle, menu)=>{
    header.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    menu.setAttribute('data-menu-open', 'false');
    menu.setAttribute('aria-hidden', isDesktop() ? 'false' : 'true');
  };

  const openMenu = (header, toggle, menu)=>{
    header.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    menu.setAttribute('data-menu-open', 'true');
    menu.setAttribute('aria-hidden', 'false');
  };

  const enhanceHeader = (header)=>{
    if(!header || header.dataset.headerReady === 'true'){
      return;
    }

    const toggle = header.querySelector('.nav-toggle');
    const menu = header.querySelector('[data-header-menu]');
    if(!toggle || !menu){
      header.dataset.headerReady = 'true';
      return;
    }

    const handleToggle = ()=>{
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      if(expanded){
        closeMenu(header, toggle, menu);
      } else {
        openMenu(header, toggle, menu);
        const firstLink = menu.querySelector('a, button');
        if(firstLink){
          firstLink.focus();
        }
      }
    };

    toggle.addEventListener('click', handleToggle);

    document.addEventListener('click', (event)=>{
      if(header.classList.contains('is-open') && !header.contains(event.target)){
        closeMenu(header, toggle, menu);
      }
    });

    document.addEventListener('keydown', (event)=>{
      if(event.key === 'Escape' && header.classList.contains('is-open')){
        closeMenu(header, toggle, menu);
        toggle.focus();
      }
    });

    const handleMediaChange = ()=>{
      if(isDesktop()){
        closeMenu(header, toggle, menu);
      }
    };

    if(DESKTOP_MEDIA && typeof DESKTOP_MEDIA.addEventListener === 'function'){
      DESKTOP_MEDIA.addEventListener('change', handleMediaChange);
    } else if(DESKTOP_MEDIA && typeof DESKTOP_MEDIA.addListener === 'function'){
      DESKTOP_MEDIA.addListener(handleMediaChange);
    } else {
      window.addEventListener('resize', handleMediaChange);
    }

    header.addEventListener('focusout', (event)=>{
      if(!header.classList.contains('is-open')){
        return;
      }
      if(!header.contains(event.relatedTarget)){
        closeMenu(header, toggle, menu);
      }
    });

    closeMenu(header, toggle, menu);

    header.dataset.headerReady = 'true';
  };

  const init = ()=>{
    const existing = document.getElementById(HEADER_ID);
    const needsLoad = !existing || existing.children.length === 0;

    const afterSetup = (header)=>{
      if(header){
        enhanceHeader(header);
      }
    };

    if(needsLoad){
      fetch(PARTIAL_URL, { credentials: 'same-origin' })
        .then((response)=>{
          if(!response.ok){
            throw new Error('Failed to load header partial');
          }
          return response.text();
        })
        .then((html)=>{
          const header = createHeaderFromHTML(html);
          const current = document.getElementById(HEADER_ID);
          const inserted = placeHeader(header, current);
          afterSetup(inserted || document.getElementById(HEADER_ID));
        })
        .catch((error)=>{
          console.warn('site-header: unable to load header partial', error);
          afterSetup(document.getElementById(HEADER_ID));
        });
    } else {
      afterSetup(existing);
    }
  };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
