/* ==========================================================
   PREMIUM PORTFOLIO - MAIN JAVASCRIPT
   Advanced animations, 3D effects, and interactivity
========================================================== */

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================
  // 1. LOADING SCREEN
  // ==========================================================
  const loader = document.getElementById('loader');
  const loaderStatus = document.querySelector('.loader-status');

  const loadingMessages = [
    'Initializing Systems...',
    'Loading Assets...',
    'Preparing Experience...',
    'Almost Ready...'
  ];

  let messageIndex = 0;
  const messageInterval = setInterval(() => {
    messageIndex = (messageIndex + 1) % loadingMessages.length;
    if (loaderStatus) {
      loaderStatus.textContent = loadingMessages[messageIndex];
    }
  }, 500);

  // Hide loader after content loads
  window.addEventListener('load', () => {
    clearInterval(messageInterval);
    setTimeout(() => {
      if (loader) {
        loader.classList.add('hidden');
      }
      // Start animations after loader hides
      initAnimations();

      // Fallback: Ensure all content is visible after 1 second
      // This catches any elements that didn't animate properly
      setTimeout(() => {
        document.querySelectorAll('.skill-card, .project-card, .achievement-card, .timeline-item').forEach(el => {
          if (getComputedStyle(el).opacity === '0') {
            el.style.opacity = '1';
            el.style.transform = 'none';
          }
        });
      }, 1000);
    }, 1800);
  });

  // ==========================================================
  // 2. LENIS SMOOTH SCROLL
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
  // 3. CUSTOM CURSOR
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
    const hoverTargets = document.querySelectorAll('a, button, .project-card, .skill-card, .nav-link, .btn');

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
  // 4. NAVIGATION
  // ==========================================================
  const nav = document.getElementById('nav');
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  const sections = document.querySelectorAll('section[id]');

  // Scroll effect for nav — RAF-throttled for performance
  let lastScroll = 0;
  let scrollTicking = false;

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        const currentScroll = window.scrollY;

        // Add/remove scrolled class
        if (currentScroll > 50) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }

        lastScroll = currentScroll;

        // Update active link based on scroll position
        let current = '';

        sections.forEach(section => {
          const sectionTop = section.offsetTop - 200;
          const sectionHeight = section.offsetHeight;

          if (currentScroll >= sectionTop && currentScroll < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
          }
        });

        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
          }
        });

        scrollTicking = false;
      });
      scrollTicking = true;
    }
  });

  // Smooth scroll for nav links
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        if (lenis) {
          lenis.scrollTo(targetSection, { offset: -80 });
        } else {
          targetSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // Mobile menu toggle
  if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenuBtn.classList.toggle('active');
      mobileNav.classList.toggle('active');
      document.body.classList.toggle('no-scroll');
    });

    mobileNavLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        // Close mobile menu
        mobileMenuBtn.classList.remove('active');
        mobileNav.classList.remove('active');
        document.body.classList.remove('no-scroll');

        // Scroll to section
        setTimeout(() => {
          if (targetSection) {
            if (lenis) {
              lenis.scrollTo(targetSection, { offset: -80 });
            } else {
              targetSection.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }, 300);
      });
    });
  }

  // ==========================================================
  // 5. SPLINE 3D HERO BACKGROUND
  // ==========================================================
  // Spline is initialized via inline module script in index.html
  // to avoid race conditions with ES module loading.

  // ==========================================================
  // 6. GSAP ANIMATIONS
  // ==========================================================
  function initAnimations() {
    // If GSAP is not available, ensure all elements are visible
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('GSAP not loaded - showing elements without animation');
      document.querySelectorAll('.skill-card, .project-card, .achievement-card, .timeline-item').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Performance: limit callbacks and batch scroll calculations
    ScrollTrigger.config({ limitCallbacks: true, syncInterval: 50 });

    // Hero animations
    const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

    heroTimeline
      .from('.hero-badge', {
        opacity: 0,
        y: 20,
        duration: 0.8
      })
      .from('.title-word', {
        opacity: 0,
        y: 80,
        duration: 1,
        stagger: 0.1
      }, '-=0.4')
      .from('.hero-description', {
        opacity: 0,
        y: 30,
        duration: 0.8
      }, '-=0.6')
      .from('.hero-cta .btn', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.15
      }, '-=0.4')
      .from('.hero-stats', {
        opacity: 0,
        y: 30,
        duration: 0.8
      }, '-=0.3')
      .from('.hero-scroll', {
        opacity: 0,
        y: 20,
        duration: 0.6
      }, '-=0.2');

    // Counter animation for stats
    const statNumbers = document.querySelectorAll('.stat-number');

    statNumbers.forEach(stat => {
      const target = parseInt(stat.getAttribute('data-count'));

      gsap.to(stat, {
        innerHTML: target,
        duration: 2,
        ease: 'power2.out',
        snap: { innerHTML: 1 },
        scrollTrigger: {
          trigger: stat,
          start: 'top 90%'
        }
      });
    });

    // Section title character-split animations
    gsap.utils.toArray('.section-header').forEach(header => {
      const label = header.querySelector('.section-label');
      const title = header.querySelector('.section-title');
      const desc = header.querySelector('.section-description');

      if (label) {
        gsap.from(label, {
          opacity: 0,
          y: 30,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: { trigger: header, start: 'top 80%' }
        });
      }

      if (title) {
        const chars = splitTextToChars(title);
        if (chars.length) {
          gsap.fromTo(chars,
            { opacity: 0, y: 40, rotateX: -90, transformOrigin: 'bottom center' },
            {
              opacity: 1,
              y: 0,
              rotateX: 0,
              duration: 0.6,
              stagger: 0.02,
              ease: 'back.out(1.5)',
              scrollTrigger: { trigger: header, start: 'top 80%' }
            }
          );
        }
      }

      if (desc) {
        gsap.from(desc, {
          opacity: 0,
          y: 30,
          duration: 0.8,
          delay: 0.3,
          ease: 'power3.out',
          scrollTrigger: { trigger: header, start: 'top 80%' }
        });
      }
    });

    // Contact title char-split animation
    const contactTitle = document.querySelector('.contact-title');
    if (contactTitle) {
      const contactChars = splitTextToChars(contactTitle);
      if (contactChars.length) {
        gsap.fromTo(contactChars,
          { opacity: 0, y: 30, rotateX: -90, transformOrigin: 'bottom center' },
          {
            opacity: 1, y: 0, rotateX: 0,
            duration: 0.5, stagger: 0.02, ease: 'back.out(1.5)',
            scrollTrigger: { trigger: '.contact-wrapper', start: 'top 75%' }
          }
        );
      }
    }

    // Achievements title char-split animation
    const achTitle = document.querySelector('.achievements-title');
    if (achTitle) {
      const achChars = splitTextToChars(achTitle);
      if (achChars.length) {
        gsap.fromTo(achChars,
          { opacity: 0, y: 30, rotateX: -90, transformOrigin: 'bottom center' },
          {
            opacity: 1, y: 0, rotateX: 0,
            duration: 0.5, stagger: 0.02, ease: 'back.out(1.5)',
            scrollTrigger: { trigger: '.achievements', start: 'top 80%' }
          }
        );
      }
    }

    // About image — clip-path circle reveal
    gsap.fromTo('.about-image',
      { clipPath: 'circle(0% at 50% 50%)' },
      {
        clipPath: 'circle(75% at 50% 50%)',
        duration: 1.5,
        ease: 'power3.inOut',
        scrollTrigger: { trigger: '.about-grid', start: 'top 70%' }
      }
    );

    gsap.from('.about-image-container', {
      opacity: 0,
      scale: 0.95,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.about-grid', start: 'top 70%' }
    });

    gsap.from('.about-float-card', {
      opacity: 0,
      scale: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: 'back.out(1.7)',
      scrollTrigger: {
        trigger: '.about-grid',
        start: 'top 70%'
      }
    });

    gsap.from('.about-content > *', {
      opacity: 0,
      x: 50,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.about-content',
        start: 'top 70%'
      }
    });

    // Skills section — horizontal scroll (desktop) or grid stagger (mobile)
    const skillsWrapper = document.querySelector('.skills-horizontal-wrapper');
    const skillsTrack = document.querySelector('.skills-horizontal-track');

    if (skillsWrapper && skillsTrack && window.innerWidth > 900) {
      // Horizontal pinned scroll on desktop
      const totalScrollWidth = skillsTrack.scrollWidth - skillsWrapper.offsetWidth;

      gsap.to(skillsTrack, {
        x: -totalScrollWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: '.skills',
          start: 'top top',
          end: () => '+=' + totalScrollWidth,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1
        }
      });

      // Fade in cards during horizontal scroll
      gsap.fromTo('.skill-card',
        { opacity: 0, scale: 0.8, rotateY: -15 },
        {
          opacity: 1, scale: 1, rotateY: 0,
          duration: 0.5, stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.skills',
            start: 'top 80%',
            once: true
          }
        }
      );
    } else {
      // Mobile fallback: grid stagger animation
      gsap.fromTo('.skill-card',
        { opacity: 0, y: 60, rotateX: -15, scale: 0.9 },
        {
          opacity: 1, y: 0, rotateX: 0, scale: 1,
          duration: 0.8,
          stagger: { amount: 1, from: 'center' },
          ease: 'back.out(1.2)',
          scrollTrigger: {
            trigger: '.skills-horizontal-track',
            start: 'top 85%',
            once: true
          }
        }
      );
    }

    // Add 3D tilt effect and shine element to skill cards
    const skillCards = document.querySelectorAll('.skill-card');
    skillCards.forEach(card => {
      // Add shine element for hover effect
      const shine = document.createElement('div');
      shine.className = 'skill-card-shine';
      card.appendChild(shine);

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / centerY * -8;
        const rotateY = (x - centerX) / centerX * 8;

        gsap.to(card, {
          rotateX: rotateX,
          rotateY: rotateY,
          duration: 0.3,
          ease: 'power2.out',
          transformPerspective: 1000
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.5)'
        });
      });
    });

    // Project cards — batched entrance (1 trigger instead of N)
    gsap.set('.project-card', { opacity: 0, y: 50 });
    ScrollTrigger.batch('.project-card', {
      start: 'top 85%',
      once: true,
      onEnter: (batch) => {
        gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' });
        batch.forEach(card => {
          const img = card.querySelector('.project-image img');
          if (img) {
            gsap.fromTo(img,
              { clipPath: 'inset(100% 0 0 0)' },
              { clipPath: 'inset(0% 0 0 0)', duration: 1.2, ease: 'power3.inOut' }
            );
          }
        });
      }
    });

    // Timeline items - Enhanced staggered reveal with marker animation
    gsap.utils.toArray('.timeline-item').forEach((item, i) => {
      const marker = item.querySelector('.marker-dot');
      const content = item.querySelector('.timeline-content');
      const markerLine = item.querySelector('.marker-line');

      // Create a timeline for each item
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
          once: true
        }
      });

      // Animate marker dot first with a pop effect
      tl.fromTo(marker,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: 'back.out(2)'
        }
      )
        // Then animate the line growing
        .fromTo(markerLine,
          { scaleY: 0, transformOrigin: 'top center' },
          {
            scaleY: 1,
            duration: 0.4,
            ease: 'power2.out'
          },
          '-=0.2'
        )
        // Finally slide in the content card
        .fromTo(content,
          {
            opacity: 0,
            x: -60,
            rotateY: -5
          },
          {
            opacity: 1,
            x: 0,
            rotateY: 0,
            duration: 0.8,
            ease: 'power3.out'
          },
          '-=0.3'
        );
    });

    // Achievement cards — staggered entrance + glow tracking
    const achievementCards = document.querySelectorAll('.achievement-card');
    achievementCards.forEach((card, i) => {
      const icon = card.querySelector('.achievement-icon');
      const inner = card.querySelector('.achievement-card-inner');
      const tags = card.querySelectorAll('.achievement-tags span');

      // Scroll-triggered entrance
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          once: true
        }
      });

      tl.fromTo(card,
        { opacity: 0, y: 40, scale: 0.96 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.7,
          delay: i * 0.12,
          ease: 'power3.out'
        }
      )
      .fromTo(icon,
        { scale: 0, rotate: -90 },
        { scale: 1, rotate: 0, duration: 0.5, ease: 'back.out(2.5)' },
        '-=0.4'
      )
      .fromTo(tags,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' },
        '-=0.2'
      );

      // Mouse-following glow on inner card
      inner.addEventListener('mousemove', (e) => {
        const rect = inner.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        inner.style.setProperty('--gx', x + 'px');
        inner.style.setProperty('--gy', y + 'px');
      });
    });

    // Contact section - Enhanced animations
    const contactTl = gsap.timeline({
      scrollTrigger: {
        trigger: '.contact-wrapper',
        start: 'top 75%',
        once: true
      }
    });

    // Contact section label and description (title handled by char-split above)
    contactTl.from('.contact .section-label', {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: 'power3.out'
    })
      .from('.contact-description', {
        opacity: 0,
        y: 30,
        duration: 0.6,
        ease: 'power3.out'
      }, '-=0.3');

    // Contact items with staggered slide-in
    gsap.fromTo('.contact-item',
      {
        opacity: 0,
        x: -50,
        rotateY: -10
      },
      {
        opacity: 1,
        x: 0,
        rotateY: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: 'back.out(1.2)',
        scrollTrigger: {
          trigger: '.contact-info',
          start: 'top 85%',
          once: true
        }
      }
    );

    // Social links with bounce effect
    gsap.fromTo('.social-link',
      {
        opacity: 0,
        scale: 0,
        rotate: -180
      },
      {
        opacity: 1,
        scale: 1,
        rotate: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'back.out(2)',
        scrollTrigger: {
          trigger: '.contact-socials',
          start: 'top 90%',
          once: true
        }
      }
    );

    // Code card with 3D reveal
    gsap.fromTo('.contact-card',
      {
        opacity: 0,
        rotateY: 20,
        rotateX: -10,
        x: 60,
        scale: 0.9
      },
      {
        opacity: 1,
        rotateY: 0,
        rotateX: 0,
        x: 0,
        scale: 1,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.contact-visual',
          start: 'top 80%',
          once: true
        }
      }
    );

    // Add 3D tilt effect to contact card
    const contactCard = document.querySelector('.contact-card');
    if (contactCard) {
      contactCard.addEventListener('mousemove', (e) => {
        const rect = contactCard.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / centerY * -8;
        const rotateY = (x - centerX) / centerX * 8;

        gsap.to(contactCard, {
          rotateX: rotateX,
          rotateY: rotateY,
          duration: 0.4,
          ease: 'power2.out',
          transformPerspective: 1000
        });
      });

      contactCard.addEventListener('mouseleave', () => {
        gsap.to(contactCard, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.5)'
        });
      });
    }

    // Add magnetic effect to social links
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
      link.addEventListener('mousemove', (e) => {
        const rect = link.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(link, {
          x: x * 0.3,
          y: y * 0.3,
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      link.addEventListener('mouseleave', () => {
        gsap.to(link, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.5)'
        });
      });
    });

    // Parallax effects on orbs (only if they exist in HTML)
    if (document.querySelector('.hero-orb-1')) {
      gsap.to('.hero-orb-1', {
        y: -100,
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
      });
    }
    if (document.querySelector('.hero-orb-2')) {
      gsap.to('.hero-orb-2', {
        y: -150,
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
      });
    }

    // ==========================================================
    // SCROLL PROGRESS BAR
    // ==========================================================
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


    // ==========================================================
    // PARALLAX DEPTH LAYERS
    // ==========================================================
    gsap.utils.toArray('.parallax-shape').forEach(shape => {
      const speed = parseFloat(shape.getAttribute('data-speed')) || 0.05;
      const section = shape.closest('.section');
      if (!section) return;

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
    });

    // Parallax on about image (subtle vertical offset)
    gsap.to('.about-image-container', {
      y: -30,
      ease: 'none',
      scrollTrigger: {
        trigger: '.about-grid',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });

    // About floating cards parallax
    gsap.to('.about-float-1', {
      y: -40,
      ease: 'none',
      scrollTrigger: {
        trigger: '.about-image-wrapper',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });

    gsap.to('.about-float-2', {
      y: -20,
      ease: 'none',
      scrollTrigger: {
        trigger: '.about-image-wrapper',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });

    // ==========================================================
    // PUBLICATIONS CARD — DRAMATIC 3D ENTRANCE
    // ==========================================================
    const pubCard = document.querySelector('.publication-card');
    if (pubCard) {
      const pubBadge = pubCard.querySelector('.publication-badge');

      const pubTl = gsap.timeline({
        scrollTrigger: {
          trigger: '.publications-grid',
          start: 'top 80%',
          once: true
        }
      });

      pubTl
        .fromTo(pubCard,
          {
            opacity: 0,
            x: -100,
            rotateY: -15,
            rotateX: 5,
            scale: 0.9,
            transformPerspective: 1200
          },
          {
            opacity: 1, x: 0, rotateY: 0, rotateX: 0, scale: 1,
            duration: 1.2,
            ease: 'power3.out'
          }
        )
        .fromTo(pubBadge,
          { opacity: 0, scale: 0, rotate: -90 },
          {
            opacity: 1, scale: 1, rotate: 0,
            duration: 0.6,
            ease: 'back.out(2)'
          },
          '-=0.6'
        )
        .fromTo('.publication-venue, .publication-authors, .publication-abstract, .publication-tags, .publication-footer, .publication-link',
          { opacity: 0, y: 20 },
          {
            opacity: 1, y: 0,
            duration: 0.5, stagger: 0.1,
            ease: 'power2.out'
          },
          '-=0.3'
        );
    }

    // Refresh all ScrollTrigger positions after setup
    ScrollTrigger.refresh();
  }

  // ==========================================================
  // 7. MAGNETIC EFFECT ON SKILL CARDS
  // ==========================================================
  const skillCards = document.querySelectorAll('.skill-card');

  skillCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const moveX = (x - centerX) / centerX * 10;
      const moveY = (y - centerY) / centerY * 10;

      if (typeof gsap !== 'undefined') {
        gsap.to(card, {
          x: moveX,
          y: moveY,
          rotationX: -moveY * 0.5,
          rotationY: moveX * 0.5,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    });

    card.addEventListener('mouseleave', () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(card, {
          x: 0,
          y: 0,
          rotationX: 0,
          rotationY: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.5)'
        });
      }
    });
  });

  // ==========================================================
  // 8. PROJECT CARD 3D TILT
  // ==========================================================
  const projectCards = document.querySelectorAll('.project-card');

  projectCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / centerY * -5;
      const rotateY = (x - centerX) / centerX * 5;

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
  // 9. ABOUT IMAGE 3D TILT
  // ==========================================================
  const aboutImageContainer = document.querySelector('.about-image-container');

  if (aboutImageContainer) {
    aboutImageContainer.addEventListener('mousemove', (e) => {
      const rect = aboutImageContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / centerY * -10;
      const rotateY = (x - centerX) / centerX * 10;

      if (typeof gsap !== 'undefined') {
        gsap.to(aboutImageContainer, {
          rotationX: rotateX,
          rotationY: rotateY,
          transformPerspective: 1000,
          duration: 0.4,
          ease: 'power2.out'
        });

        gsap.to('.about-image-glow', {
          x: (x - centerX) * 0.1,
          y: (y - centerY) * 0.1,
          duration: 0.4,
          ease: 'power2.out'
        });
      }
    });

    aboutImageContainer.addEventListener('mouseleave', () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(aboutImageContainer, {
          rotationX: 0,
          rotationY: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.3)'
        });

        gsap.to('.about-image-glow', {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.3)'
        });
      }
    });
  }

  // ==========================================================
  // 10. BUTTON MAGNETIC EFFECT
  // ==========================================================
  const magneticButtons = document.querySelectorAll('.btn-primary, .btn-secondary');

  magneticButtons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      if (typeof gsap !== 'undefined') {
        gsap.to(btn, {
          x: x * 0.3,
          y: y * 0.3,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    });

    btn.addEventListener('mouseleave', () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.3)'
        });
      }
    });
  });

  // ==========================================================
  // 11. PRELOAD IMAGES
  // ==========================================================
  const images = document.querySelectorAll('img');

  images.forEach(img => {
    if (img.complete) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => {
        img.classList.add('loaded');
      });
    }
  });

  // ==========================================================
  // 13. TYPING EFFECT FOR CONTACT CODE
  // ==========================================================
  const codeBlock = document.querySelector('.card-body code');

  if (codeBlock && typeof gsap !== 'undefined') {
    const codeContent = codeBlock.innerHTML;

    ScrollTrigger.create({
      trigger: '.contact-card',
      start: 'top 80%',
      onEnter: () => {
        // Could implement typing animation here
        gsap.from(codeBlock, {
          opacity: 0,
          duration: 1,
          ease: 'power2.out'
        });
      },
      once: true
    });
  }

  // ==========================================================
  // 14. SOCIAL LINK HOVER EFFECTS
  // ==========================================================
  const socialLinks = document.querySelectorAll('.social-link, .about-link');

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

  // ==========================================================
  // 15. INTERSECTION OBSERVER FOR LAZY LOADING
  // ==========================================================
  const lazyElements = document.querySelectorAll('[data-lazy]');

  const lazyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        lazyObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  lazyElements.forEach(el => lazyObserver.observe(el));

  // ==========================================================
  // 16. KEYBOARD NAVIGATION
  // ==========================================================
  document.addEventListener('keydown', (e) => {
    // Press 'Escape' to close mobile menu
    if (e.key === 'Escape' && mobileNav && mobileNav.classList.contains('active')) {
      mobileMenuBtn.classList.remove('active');
      mobileNav.classList.remove('active');
      document.body.classList.remove('no-scroll');
    }
  });

  // ==========================================================
  // 17. PERFORMANCE OPTIMIZATION
  // ==========================================================
  // Reduce animations on low-power devices
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    if (typeof gsap !== 'undefined') {
      gsap.globalTimeline.timeScale(0);
    }
  }

  // ==========================================================
  // 18. CONSOLE EASTER EGG
  // ==========================================================
  console.log('%c Hello, curious developer! ', 'background: linear-gradient(135deg, #06b6d4, #22d3ee); color: white; font-size: 16px; padding: 10px; border-radius: 5px;');
  console.log('%c This portfolio was crafted with passion by Manas Reddy Arumalla ', 'color: #8a8f98; font-size: 12px;');
  console.log('%c Interested in robotics? Let\'s connect! ', 'color: #22d3ee; font-size: 12px;');

});

// ==========================================================
// UTILITY FUNCTIONS
// ==========================================================

// Debounce function for performance
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function for scroll events
function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ==========================================================
// SPLIT TEXT INTO CHARACTERS FOR ANIMATION
// ==========================================================
function splitTextToChars(element) {
  if (!element || element.querySelector('.char')) return element ? element.querySelectorAll('.char') : [];

  const nodes = Array.from(element.childNodes);
  element.innerHTML = '';

  function processText(text, parent) {
    // Collapse whitespace: trim leading/trailing, normalize internal spaces
    const trimmed = text.replace(/\s+/g, ' ');
    if (!trimmed.trim()) return; // Skip whitespace-only nodes

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
