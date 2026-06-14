/* ========================================================
   IMPALA FOUNDATION — Main JS
   ======================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Navbar scroll behaviour ── */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    const toggle = () => navbar.classList.toggle('scrolled', window.scrollY > 50);
    toggle();
    window.addEventListener('scroll', toggle, { passive: true });
  }

  /* ── Active nav link ── */
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === current || (current === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ── Mobile hamburger ── */
  const hamburger = document.querySelector('.hamburger');
  const navLinks  = document.querySelector('.nav-links');
  const overlay   = document.querySelector('.nav-overlay');

  function closeMenu() {
    hamburger?.classList.remove('open');
    navLinks?.classList.remove('open');
    overlay?.classList.remove('open');
    document.body.style.overflow = '';
  }
  hamburger?.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    navLinks?.classList.toggle('open', open);
    overlay?.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  overlay?.addEventListener('click', closeMenu);
  document.querySelectorAll('.nav-links .nav-link').forEach(l => l.addEventListener('click', closeMenu));

  /* ── Scroll-reveal (Intersection Observer) ── */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.fade-in').forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 0.1}s`;
    observer.observe(el);
  });

  /* ── Counter animation ── */
  function animateCount(el, target, suffix = '') {
    let start = 0;
    const duration = 1800;
    const step = timestamp => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(ease * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        animateCount(el, target, suffix);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

  /* ── Gallery Lightbox ── */
  const lightbox     = document.querySelector('.lightbox');
  const lightboxImg  = document.querySelector('.lightbox-img');
  const lightboxClose = document.querySelector('.lightbox-close');
  const lightboxPrev = document.querySelector('.lightbox-prev');
  const lightboxNext = document.querySelector('.lightbox-next');

  if (lightbox && lightboxImg) {
    let galleryImages = [];
    let currentIdx = 0;

    function openLightbox(imgs, idx) {
      galleryImages = imgs;
      currentIdx = idx;
      lightboxImg.src = imgs[idx];
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
    function showImage(idx) {
      currentIdx = (idx + galleryImages.length) % galleryImages.length;
      lightboxImg.style.opacity = '0';
      setTimeout(() => {
        lightboxImg.src = galleryImages[currentIdx];
        lightboxImg.style.opacity = '1';
      }, 150);
    }

    lightboxImg.style.transition = 'opacity .15s ease';

    document.querySelectorAll('.gallery-item').forEach((item, i) => {
      item.addEventListener('click', () => {
        const siblings = [...item.closest('.gallery-grid').querySelectorAll('.gallery-item img')];
        const imgs = siblings.map(img => img.src);
        openLightbox(imgs, i);
      });
    });

    lightboxClose?.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
    lightboxPrev?.addEventListener('click', () => showImage(currentIdx - 1));
    lightboxNext?.addEventListener('click', () => showImage(currentIdx + 1));

    document.addEventListener('keydown', e => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showImage(currentIdx - 1);
      if (e.key === 'ArrowRight') showImage(currentIdx + 1);
    });
  }

  /* ── Form submission via Formspree ── */
  document.querySelectorAll('form[data-form]').forEach(form => {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn      = form.querySelector('[type=submit]');
      const successEl = form.querySelector('.form-success');
      const original = btn.textContent;
      const endpoint = form.getAttribute('action');

      if (!endpoint || endpoint.includes('YOUR_FORM_ID')) {
        alert('Form not yet connected. Please add your Formspree form ID to the action attribute.');
        return;
      }

      btn.disabled    = true;
      btn.textContent = 'Sending…';

      try {
        const res = await fetch(endpoint, {
          method:  'POST',
          headers: { 'Accept': 'application/json' },
          body:    new FormData(form),
        });

        if (res.ok) {
          if (successEl) {
            successEl.classList.add('show');
            setTimeout(() => successEl.classList.remove('show'), 7000);
          }
          form.reset();
        } else {
          const data = await res.json();
          alert(data?.errors?.map(e => e.message).join(', ') || 'Something went wrong. Please try again.');
        }
      } catch {
        alert('Network error. Please check your connection and try again.');
      }

      btn.disabled    = false;
      btn.textContent = original;
    });
  });

  /* ── Smooth anchor scroll ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        closeMenu();
      }
    });
  });

});
