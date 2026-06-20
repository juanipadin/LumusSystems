(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#nav-menu');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const track = (name, props = {}) => {
    const payload = {
      page_path: window.location.pathname,
      ...props
    };
    if (typeof window.plausible === 'function') {
      window.plausible(name, { props: payload });
      return;
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: name, ...payload });
  };

  const closeMenu = () => {
    if (!menuButton || !menu) return;
    menu.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menú');
  };

  if (menuButton && menu) {
    menuButton.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', isOpen);
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    });
  }

  document.addEventListener('click', (event) => {
    if (!menuButton || !menu || !menu.classList.contains('is-open')) return;
    if (menu.contains(event.target) || menuButton.contains(event.target)) return;
    closeMenu();
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      closeMenu();
      target.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start'
      });
      history.pushState(null, '', id);
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  document.querySelectorAll('[data-track]').forEach((element) => {
    element.addEventListener('click', () => {
      const target = element.getAttribute('href') || element.getAttribute('type') || '';
      const name = target.startsWith('mailto:') ? 'mailto_click' : 'cta_click';
      track(name, {
        cta_location: element.dataset.track,
        target
      });
    });
  });

  document.querySelectorAll('.resource-card').forEach((element) => {
    element.addEventListener('click', () => {
      track('resource_click', {
        target: element.getAttribute('href') || '',
        cta_location: 'resource-card'
      });
    });
  });

  document.querySelectorAll('form').forEach((form) => {
    let started = false;
    form.addEventListener('input', () => {
      if (started) return;
      started = true;
      track('form_start', { form_name: form.getAttribute('name') || 'contact' });
    });
    form.addEventListener('submit', () => {
      track('form_submit_success', { form_name: form.getAttribute('name') || 'contact' });
    });
    form.addEventListener('invalid', (event) => {
      track('form_submit_error', {
        form_name: form.getAttribute('name') || 'contact',
        field: event.target && event.target.name ? event.target.name : 'unknown'
      });
    }, true);
  });

  const stickyCta = document.querySelector('.mobile-sticky-cta');
  const contactSection = document.querySelector('#contacto');
  let stickyDismissed = false;
  const updateStickyCta = () => {
    if (!stickyCta) return;
    if (window.scrollY < 240) stickyDismissed = false;
    const contactRect = contactSection ? contactSection.getBoundingClientRect() : null;
    const formRect = document.querySelector('.contact-form')?.getBoundingClientRect();
    const nearContact = contactSection ? window.scrollY >= contactSection.offsetTop - window.innerHeight * 0.7 : false;
    const contactVisible = Boolean(
      nearContact ||
      (contactRect && contactRect.top < window.innerHeight * 0.88 && contactRect.bottom > 0) ||
      (formRect && formRect.top < window.innerHeight * 0.92 && formRect.bottom > 0)
    );
    const shouldShow = window.innerWidth < 768 && window.scrollY > Math.min(720, window.innerHeight * 0.9) && !contactVisible && !stickyDismissed;
    stickyCta.classList.toggle('is-hidden', !shouldShow);
  };
  if (stickyCta) {
    updateStickyCta();
    stickyCta.addEventListener('click', () => {
      stickyDismissed = true;
      stickyCta.classList.add('is-hidden');
    });
    window.addEventListener('scroll', updateStickyCta, { passive: true });
    window.addEventListener('resize', updateStickyCta);
    window.setInterval(updateStickyCta, 300);
  }
})();
