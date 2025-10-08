(function(){
  const containers = document.querySelectorAll('[data-mobile-actions-container]');
  if(!containers.length) return;

  let partialPromise;
  const loadPartial = ()=>{
    if(!partialPromise){
      partialPromise = fetch('/assets/partials/mobile-actions.html', { credentials: 'same-origin' })
        .then((response)=>{
          if(!response.ok) throw new Error('Failed to load mobile actions partial');
          return response.text();
        });
    }
    return partialPromise;
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
      // clone children to preserve SVG namespace and attributes:
      link.childNodes.forEach((n)=> anchor.appendChild(n.cloneNode(true)));
      copyLinkAttributes(link, anchor);
      if(anchor.getAttribute('target') === '_blank'){
        anchor.setAttribute('rel','noopener noreferrer');
      }
      item.appendChild(anchor);
      list.appendChild(item);
    });
  };

  containers.forEach((container)=>{
    loadPartial().then((html)=>{
      container.innerHTML = html;
      const root = container.querySelector('[data-mobile-actions-root]') || container;
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
    }).catch((error)=>{
      console.error(error);
    });
  });
})();
