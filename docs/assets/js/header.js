(function(){
  const HEADER_ID = 'site-header';
  const supportsMatchMedia = typeof window.matchMedia === 'function';
  const DESKTOP_MEDIA = supportsMatchMedia ? window.matchMedia('(min-width: 1024px)') : null;

  const isDesktop = ()=> DESKTOP_MEDIA ? DESKTOP_MEDIA.matches : window.innerWidth >= 1024;

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
    const header = document.getElementById(HEADER_ID) || document.querySelector('.site-header');
    if(header){
      enhanceHeader(header);
    }
  };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
