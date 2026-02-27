/* ==========================================================
   PROJECTS PAGE - JAVASCRIPT
   Enhanced with scroll animations, text splits, and clip-path reveals
========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================
  // 1. LENIS SMOOTH SCROLL
  // ==========================================================
  let lenis;

  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    // Connect Lenis to GSAP ScrollTrigger — single RAF via GSAP ticker
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      // Fallback: drive Lenis with its own RAF only if GSAP isn't available
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }

  // ==========================================================
  // 2. CUSTOM CURSOR
  // ==========================================================
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorOutline = document.querySelector('.cursor-outline');

  if (cursorDot && cursorOutline && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let mouseX = 0;
    let mouseY = 0;
    let outlineX = 0;
    let outlineY = 0;

    document.body.classList.add('cursor-ready');

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      cursorDot.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;
    });

    // Smooth outline following — uses transform for GPU compositing
    function animateCursor() {
      outlineX += (mouseX - outlineX) * 0.15;
      outlineY += (mouseY - outlineY) * 0.15;

      cursorOutline.style.transform = `translate(${outlineX - 20}px, ${outlineY - 20}px)`;

      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover effects
    const hoverTargets = document.querySelectorAll('a, button, .project-card-full, .nav-link, .btn, .modal-close');

    hoverTargets.forEach(target => {
      target.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
      });
      target.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
      });
    });

    // Click effect
    document.addEventListener('mousedown', () => {
      document.body.classList.add('cursor-click');
    });
    document.addEventListener('mouseup', () => {
      document.body.classList.remove('cursor-click');
    });
  }

  // ==========================================================
  // 3. NAVIGATION
  // ==========================================================
  const nav = document.getElementById('nav');
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileNav = document.querySelector('.mobile-nav');

  // Scroll effect for nav
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenuBtn.classList.toggle('active');
      mobileNav.classList.toggle('active');
      document.body.classList.toggle('no-scroll');
    });

    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('active');
        mobileNav.classList.remove('active');
        document.body.classList.remove('no-scroll');
      });
    });
  }

  // ==========================================================
  // 4. GSAP ANIMATIONS — ENHANCED
  // ==========================================================
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // --- Scroll Progress Bar ---
    const scrollProgressBar = document.getElementById('scrollProgress');
    if (scrollProgressBar) {
      gsap.to(scrollProgressBar, {
        width: '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: document.documentElement,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.3
        }
      });
    }

    // --- Hero: back link slide-in ---
    gsap.from('.back-link', {
      opacity: 0,
      x: -30,
      duration: 0.6,
      delay: 0.2,
      ease: 'power3.out'
    });

    // --- Hero title: character-split animation ---
    const heroTitle = document.querySelector('.projects-hero-title');
    if (heroTitle) {
      const chars = splitTextToChars(heroTitle);
      gsap.fromTo(chars,
        { opacity: 0, y: 40, rotateX: -90, transformOrigin: 'bottom center' },
        {
          opacity: 1, y: 0, rotateX: 0,
          duration: 0.6, stagger: 0.025, delay: 0.3,
          ease: 'back.out(1.5)'
        }
      );
    }

    // --- Hero description ---
    gsap.from('.projects-hero-desc', {
      opacity: 0,
      y: 30,
      duration: 0.8,
      delay: 0.6,
      ease: 'power3.out'
    });

    // --- Parallax depth layers ---
    gsap.utils.toArray('.parallax-shape').forEach(shape => {
      const speed = parseFloat(shape.getAttribute('data-speed')) || 0.05;
      const section = shape.closest('section') || shape.closest('.projects-hero');
      if (section) {
        gsap.to(shape, {
          y: () => window.innerHeight * speed * (speed > 0 ? -1 : 1),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        });
      }
    });

    // --- Project cards: clip-path image reveal + staggered 3D entrance ---
    gsap.utils.toArray('.project-card-full').forEach((card, i) => {
      const img = card.querySelector('.project-card-image img');

      // Image clip-path reveal
      if (img) {
        gsap.fromTo(img,
          { clipPath: 'inset(100% 0 0 0)' },
          {
            clipPath: 'inset(0% 0 0 0)',
            duration: 1.2,
            ease: 'power3.inOut',
            scrollTrigger: { trigger: card, start: 'top 85%', once: true }
          }
        );
      }

      // Card entrance with 3D rotation
      gsap.fromTo(card,
        {
          opacity: 0,
          y: 60,
          rotateX: -8,
          scale: 0.95,
          transformPerspective: 1200
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          scale: 1,
          duration: 0.9,
          delay: i * 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            once: true
          }
        }
      );
    });

  } else {
    // No GSAP - show everything immediately
    document.querySelectorAll('.project-card-full').forEach(card => {
      card.style.opacity = '1';
      card.style.transform = 'none';
    });
  }

  // ==========================================================
  // 5. PROJECT CARDS 3D TILT
  // ==========================================================
  const projectCards = document.querySelectorAll('.project-card-full');

  projectCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / centerY * -3;
      const rotateY = (x - centerX) / centerX * 3;

      if (typeof gsap !== 'undefined') {
        gsap.to(card, {
          rotationX: rotateX,
          rotationY: rotateY,
          transformPerspective: 1000,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    });

    card.addEventListener('mouseleave', () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(card, {
          rotationX: 0,
          rotationY: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.3)'
        });
      }
    });
  });

  // ==========================================================
  // 6. MODALS
  // ==========================================================
  const modals = document.querySelectorAll('.modal');
  const modalTriggers = document.querySelectorAll('[data-modal]');
  const modalCloseButtons = document.querySelectorAll('.modal-close');

  // Track if modal is open
  let modalOpen = false;

  // Open modal
  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      // Don't open modal if clicking on a link inside the card
      if (e.target.closest('.project-card-link')) return;

      const modalId = trigger.getAttribute('data-modal');
      const modal = document.getElementById(modalId);

      if (modal) {
        modalOpen = true;
        modal.classList.add('active');
        document.body.classList.add('no-scroll');
        document.body.style.overflow = 'hidden';

        // Pause Lenis while modal is open to free up wheel events
        if (lenis) {
          lenis.stop();
        }

        // Scroll modal to top
        modal.scrollTop = 0;

        // Animation
        if (typeof gsap !== 'undefined') {
          gsap.from(modal.querySelector('.modal-content'), {
            scale: 0.95,
            y: 30,
            opacity: 0,
            duration: 0.4,
            ease: 'power3.out'
          });
        }
      }
    });
  });

  // Resume Lenis (no re-creation needed — just unpause the existing instance)
  function reinitLenis() {
    if (lenis) {
      lenis.start();
    }
  }

  // Close modal functions
  function closeModal(modal) {
    modalOpen = false;
    modal.classList.remove('active');
    document.body.classList.remove('no-scroll');
    document.body.style.overflow = '';

    // Reinitialize Lenis after modal closes
    reinitLenis();

    // Stop any playing videos
    const videos = modal.querySelectorAll('video');
    videos.forEach(video => video.pause());

    const iframes = modal.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      const src = iframe.src;
      iframe.src = '';
      iframe.src = src;
    });
  }

  // Close button click
  modalCloseButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal');
      closeModal(modal);
    });
  });

  // Click outside modal
  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });

    // Enable native wheel scrolling on modal
    modal.addEventListener('wheel', (e) => {
      if (modal.classList.contains('active')) {
        e.stopPropagation();
        modal.scrollTop += e.deltaY;
      }
    }, { passive: false });
  });

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modals.forEach(modal => {
        if (modal.classList.contains('active')) {
          closeModal(modal);
        }
      });

      // Also close mobile menu
      if (mobileNav && mobileNav.classList.contains('active')) {
        mobileMenuBtn.classList.remove('active');
        mobileNav.classList.remove('active');
        document.body.classList.remove('no-scroll');
      }
    }
  });

  // ==========================================================
  // 7. BACK LINK HOVER EFFECT
  // ==========================================================
  const backLink = document.querySelector('.back-link');

  if (backLink && typeof gsap !== 'undefined') {
    backLink.addEventListener('mouseenter', () => {
      gsap.to(backLink, {
        scale: 1.05,
        duration: 0.3,
        ease: 'back.out(1.7)'
      });
    });

    backLink.addEventListener('mouseleave', () => {
      gsap.to(backLink, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
  }

  // ==========================================================
  // 8. SOCIAL LINK HOVER EFFECTS
  // ==========================================================
  const socialLinks = document.querySelectorAll('.footer-socials a');

  socialLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(link, {
          scale: 1.1,
          duration: 0.3,
          ease: 'back.out(1.7)'
        });
      }
    });

    link.addEventListener('mouseleave', () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(link, {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    });
  });

});

// ==========================================================
// SPLIT TEXT INTO CHARACTERS FOR ANIMATION
// ==========================================================
function splitTextToChars(element) {
  if (!element || element.querySelector('.char')) return element ? element.querySelectorAll('.char') : [];

  const nodes = Array.from(element.childNodes);
  element.innerHTML = '';

  function processText(text, parent) {
    const trimmed = text.replace(/\s+/g, ' ');
    if (!trimmed.trim()) return;

    trimmed.split('').forEach(char => {
      if (char === ' ') {
        const space = document.createElement('span');
        space.className = 'char-space';
        space.innerHTML = '&nbsp;';
        parent.appendChild(space);
      } else {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = char;
        parent.appendChild(span);
      }
    });
  }

  nodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      processText(node.textContent, element);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName === 'BR') {
        element.appendChild(node.cloneNode());
        return;
      }
      const clone = node.cloneNode(false);
      processText(node.textContent, clone);
      if (clone.childNodes.length > 0) {
        element.appendChild(clone);
      }
    }
  });

  return element.querySelectorAll('.char');
}
