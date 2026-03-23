// ===== NAVBAR SCROLL EFFECT (debounced, passive) =====
const navbar = document.getElementById('navbar');

if (navbar && !navbar.classList.contains('scrolled')) {
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    if (scrollTimeout) return;
    scrollTimeout = setTimeout(() => {
      scrollTimeout = null;
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, 100);
  }, { passive: true });
}

// ===== MOBILE MENU TOGGLE =====
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('active');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Close menu when clicking a link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
      navToggle.classList.remove('active');
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// ===== SCROLL ANIMATIONS =====
const fadeElements = document.querySelectorAll('.fade-in');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
});

fadeElements.forEach(el => observer.observe(el));

// ===== CONTACT FORM WITH SPAM PROTECTION =====
const contactForm = document.getElementById('contactForm');
const formLoadTime = Date.now();

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // 1. Honeypot check
    const honeypot = contactForm.querySelector('[name="website_url"]');
    if (honeypot && honeypot.value) {
      return; // Bot filled the hidden field
    }

    // 2. Time-on-page check: reject if submitted in under 3 seconds
    if (Date.now() - formLoadTime < 3000) {
      return; // Too fast, likely a bot
    }

    // 3. Rate limit: max 3 submissions per hour via localStorage
    const RATE_KEY = 'nw_form_submissions';
    const RATE_LIMIT = 3;
    const RATE_WINDOW = 60 * 60 * 1000; // 1 hour
    try {
      const stored = JSON.parse(localStorage.getItem(RATE_KEY) || '[]');
      const now = Date.now();
      const recent = stored.filter(t => now - t < RATE_WINDOW);
      if (recent.length >= RATE_LIMIT) {
        alert('You have submitted too many requests. Please try again later.');
        return;
      }
      recent.push(now);
      localStorage.setItem(RATE_KEY, JSON.stringify(recent));
    } catch (_) {
      // localStorage unavailable, proceed anyway
    }

    const formData = new FormData(contactForm);
    const submitBtn = contactForm.querySelector('.form-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    fetch(contactForm.action, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    }).then(response => {
      if (response.ok) {
        window.location.href = '/thankyou/';
      } else {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Book My Free Demo <span class="btn-arrow">&rarr;</span>';
        alert('Something went wrong. Please try again.');
      }
    }).catch(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Book My Free Demo <span class="btn-arrow">&rarr;</span>';
      alert('Something went wrong. Please try again.');
    });
  });
}

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});
