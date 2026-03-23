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

// ===== CONTACT FORM WITH FULL SPAM/BOT PROTECTION =====
const contactForm = document.getElementById('contactForm');
const formLoadTime = Date.now();

// Endpoint assembled at runtime so bots can't scrape it from source
const _ep = [104,116,116,112,115,58,47,47,102,111,114,109,115,112,114,101,101,46,105,111,47,102,47,109,110,106,103,112,107,108,112].map(c => String.fromCharCode(c)).join('');

// Generate a simple proof-of-work token (bots won't run JS to generate this)
let humanToken = '';
if (contactForm) {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  humanToken = ts + '-' + rand;

  // Inject the token as a hidden field so Formspree receives it
  const tokenInput = document.createElement('input');
  tokenInput.type = 'hidden';
  tokenInput.name = '_nw_token';
  tokenInput.value = humanToken;
  contactForm.appendChild(tokenInput);

  // Enable submit button (disabled by default in HTML to block non-JS bots)
  const btn = contactForm.querySelector('.form-submit');
  if (btn) btn.disabled = false;

  // Track user interaction (bots don't move mice or press keys)
  let hasInteracted = false;
  const markInteraction = () => { hasInteracted = true; };
  contactForm.addEventListener('keydown', markInteraction, { once: true });
  contactForm.addEventListener('mousedown', markInteraction, { once: true });
  contactForm.addEventListener('touchstart', markInteraction, { once: true, passive: true });

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // 1. Honeypot check (hidden fields filled = bot)
    const honeypot1 = contactForm.querySelector('[name="website_url"]');
    const honeypot2 = contactForm.querySelector('[name="company_fax"]');
    if ((honeypot1 && honeypot1.value) || (honeypot2 && honeypot2.value)) {
      return;
    }

    // 2. Time-on-page check: reject under 5 seconds
    if (Date.now() - formLoadTime < 5000) {
      return;
    }

    // 3. User interaction check: must have typed or clicked in the form
    if (!hasInteracted) {
      return;
    }

    // 4. JS token check: bots that skip JS won't have this
    if (!humanToken) {
      return;
    }

    // 4b. Message length check: real inquiries have substance
    const msgField = contactForm.querySelector('[name="message"]');
    if (msgField && msgField.value.trim().length < 10) {
      alert('Please provide more detail about your business.');
      return;
    }

    // 5. Email pattern check: block disposable/suspicious patterns
    const emailField = contactForm.querySelector('[name="email"]');
    if (emailField) {
      const email = emailField.value.toLowerCase().trim();
      const suspiciousPatterns = [
        /test@test/,
        /asdf@/,
        /aaa@/,
        /@mailinator\./,
        /@guerrillamail\./,
        /@tempmail\./,
        /@throwaway\./,
        /@yopmail\./,
        /@sharklasers\./,
        /@grr\.la/,
        /@dispostable\./,
      ];
      if (suspiciousPatterns.some(p => p.test(email))) {
        alert('Please use a valid email address.');
        return;
      }
    }

    // 6. Rate limit: max 3 submissions per hour via localStorage
    const RATE_KEY = 'nw_form_submissions';
    const RATE_LIMIT = 3;
    const RATE_WINDOW = 60 * 60 * 1000;
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

    // 7. Double-submit prevention
    const formData = new FormData(contactForm);
    const submitBtn = contactForm.querySelector('.form-submit');
    if (submitBtn.disabled) return;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    fetch(_ep, {
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
