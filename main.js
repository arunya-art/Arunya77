// ===== FLYNQN MAIN JS =====

// Navbar scroll
const navbar = document.getElementById('navbar');
if (navbar) window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 30));

// Hamburger
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) navLinks.classList.remove('open');
  });
}

// Scroll fade-up animations
const fadeEls = document.querySelectorAll('.fade-up');
const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
}, { threshold: 0.1 });
fadeEls.forEach(el => obs.observe(el));

// Animated counters
const counters = document.querySelectorAll('.counter');
const cObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target;
      const target = +el.dataset.target;
      let current = 0;
      const step = target / 120;
      const timer = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = Math.floor(current).toLocaleString();
      }, 16);
      cObs.unobserve(el);
    }
  });
}, { threshold: 0.5 });
counters.forEach(c => cObs.observe(c));

// Toast
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.style.borderLeftColor = type === 'error' ? '#ef4444' : '#CC5500';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3800);
}

// ===== MODALS =====
function openModal(id) {
  const modal = document.getElementById('modal-' + id);
  if (modal) { modal.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const modal = document.getElementById('modal-' + id);
  if (modal) { modal.classList.remove('open'); document.body.style.overflow = ''; }
}
// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
});
// Close on ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => {
      m.classList.remove('open');
      document.body.style.overflow = '';
    });
    const aiPanel = document.getElementById('aiChatPanel');
    if (aiPanel) aiPanel.classList.remove('open');
  }
});

// ===== POSTPARTUM SESSION TOGGLE =====
function toggleSession(type) {
  const liveBtn = document.getElementById('liveBtn');
  const recordedBtn = document.getElementById('recordedBtn');
  const liveSection = document.getElementById('liveSession');
  const recordedSection = document.getElementById('recordedSession');
  if (type === 'live') {
    liveBtn.classList.add('active'); recordedBtn.classList.remove('active');
    liveSection.style.display = ''; recordedSection.style.display = 'none';
  } else {
    recordedBtn.classList.add('active'); liveBtn.classList.remove('active');
    recordedSection.style.display = ''; liveSection.style.display = 'none';
  }
}

// ===== FORM SUBMISSION — SENDS EMAIL VIA BACKEND =====
async function submitForm(formId, endpoint, successMsg, closeModalId) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Sending...';
    btn.disabled = true;
    try {
      const data = Object.fromEntries(new FormData(form).entries());
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (res.ok) {
        showToast(successMsg);
        form.reset();
        if (closeModalId) setTimeout(() => closeModal(closeModalId), 1500);
      } else {
        showToast(result.message || 'Something went wrong.', 'error');
      }
    } catch (err) {
      showToast('Could not connect to server. Please try again.', 'error');
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}

// Wire up all forms
submitForm('contactForm', '/api/contact', '✅ Message sent! We will be in touch soon.');
submitForm('automationForm', '/api/contact', '✅ Inquiry sent! Our team will contact you shortly.', 'automation');
submitForm('bottleForm', '/api/contact', '✅ Inquiry received! We will email you soon.', 'bottle');

// Tax form — inject type=tax before submit
const taxFormEl = document.getElementById('taxForm');
if (taxFormEl) {
  taxFormEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = taxFormEl.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    btn.textContent = 'Booking...'; btn.disabled = true;
    try {
      const data = Object.fromEntries(new FormData(taxFormEl).entries());
      data.type = 'tax';
      const res = await fetch('/api/meeting', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const result = await res.json();
      if (res.ok) { showToast('✅ Meeting booked! Check your email for confirmation.'); taxFormEl.reset(); setTimeout(() => closeModal('tax'), 1500); }
      else showToast(result.message || 'Something went wrong.', 'error');
    } catch { showToast('Server error. Please try again.', 'error'); }
    finally { btn.textContent = orig; btn.disabled = false; }
  });
}

// Postpartum live form — inject type=postpartum
const postpartumFormEl = document.getElementById('postpartumForm');
if (postpartumFormEl) {
  postpartumFormEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = postpartumFormEl.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    btn.textContent = 'Booking...'; btn.disabled = true;
    try {
      const data = Object.fromEntries(new FormData(postpartumFormEl).entries());
      data.type = 'postpartum';
      const res = await fetch('/api/meeting', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const result = await res.json();
      if (res.ok) { showToast('✅ Session booked! Check your email.'); postpartumFormEl.reset(); setTimeout(() => closeModal('postpartum'), 1500); }
      else showToast(result.message || 'Something went wrong.', 'error');
    } catch { showToast('Server error. Please try again.', 'error'); }
    finally { btn.textContent = orig; btn.disabled = false; }
  });
}

// Recorded sessions form
const recordedFormEl = document.getElementById('recordedForm');
if (recordedFormEl) {
  recordedFormEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = recordedFormEl.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    btn.textContent = 'Sending...'; btn.disabled = true;
    try {
      const data = Object.fromEntries(new FormData(recordedFormEl).entries());
      data.type = 'recorded';
      const res = await fetch('/api/meeting', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const result = await res.json();
      if (res.ok) { showToast('✅ Access links sent to your email!'); recordedFormEl.reset(); setTimeout(() => closeModal('postpartum'), 1500); }
      else showToast(result.message || 'Something went wrong.', 'error');
    } catch { showToast('Server error. Please try again.', 'error'); }
    finally { btn.textContent = orig; btn.disabled = false; }
  });
}

// Login form


const loginForm = document.getElementById('loginForm');
if (loginForm) {
  // ── Auto-redirect if already logged in ──
  const existingToken = localStorage.getItem('flynqn-token');
  if (existingToken && window.location.pathname.includes('login')) {
    window.location.href = '/dashboard.html';
  }

  // ── Pre-fill saved email if Remember Me was used ──
  const savedEmail = localStorage.getItem('flynqn-remember-email');
  if (savedEmail) {
    const emailInput = loginForm.querySelector('[name="email"]');
    const rememberInput = loginForm.querySelector('[name="remember"]');
    if (emailInput) emailInput.value = savedEmail;
    if (rememberInput) rememberInput.checked = true;
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = loginForm.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    btn.textContent = 'Logging in...'; btn.disabled = true;
    try {
      const email = loginForm.querySelector('[name="email"]').value.trim();
      const password = loginForm.querySelector('[name="password"]').value;
      const remember = loginForm.querySelector('[name="remember"]')?.checked;

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        // Remember Me: save email for next visit
        if (remember) {
          localStorage.setItem('flynqn-remember-email', email);
        } else {
          localStorage.removeItem('flynqn-remember-email');
        }
        // Always save token to localStorage so session persists across tabs/refreshes
        localStorage.setItem('flynqn-token', data.token);
        localStorage.setItem('flynqn-user', JSON.stringify(data.user || {}));
        localStorage.setItem('flynqn-login-time', Date.now().toString());
        showToast('✅ Login successful! Redirecting...');
        setTimeout(() => { window.location.href = '/dashboard.html'; }, 800);
      } else {
        showToast(data.message || 'Login failed. Check your credentials.', 'error');
      }
    } catch (err) {
      showToast('Could not connect to server. Please try again.', 'error');
    } finally {
      btn.textContent = orig; btn.disabled = false;
    }
  });
}

// Signup form

const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pass = signupForm.querySelector('[name="password"]').value;
    const confirmEl = signupForm.querySelector('[name="confirmPassword"]');
    if (confirmEl && pass !== confirmEl.value) { showToast('Passwords do not match', 'error'); return; }
    const btn = signupForm.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    btn.textContent = 'Creating account...'; btn.disabled = true;
    try {
      const payload = {
        name: signupForm.querySelector('[name="name"]').value.trim(),
        email: signupForm.querySelector('[name="email"]').value.trim(),
        password: pass,
        role: signupForm.querySelector('[name="role"]')?.value || 'client'
      };
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (res.ok && result.token) {
        localStorage.setItem('flynqn-token', result.token);
        localStorage.setItem('flynqn-user', JSON.stringify(result.user));
        showToast('✅ Account created! Redirecting...');
        setTimeout(() => { window.location.href = '/dashboard.html'; }, 1000);
      } else {
        showToast(result.message || 'Signup failed', 'error');
      }
    } catch (err) { showToast('Server error. Try again.', 'error'); }
    finally { btn.textContent = orig; btn.disabled = false; }
  });
}

// Contact form on help center
const helpForm = document.getElementById('helpContactForm');
if (helpForm) {
  helpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = helpForm.querySelector('button[type="submit"]');
    btn.textContent = 'Sending...'; btn.disabled = true;
    try {
      const data = Object.fromEntries(new FormData(helpForm).entries());
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (res.ok) { showToast('✅ Support request sent!'); helpForm.reset(); }
      else showToast('Something went wrong.', 'error');
    } catch { showToast('Server error.', 'error'); }
    finally { btn.textContent = 'Submit Request'; btn.disabled = false; }
  });
}

// FAQ accordion
document.querySelectorAll('.faq-item').forEach(item => {
  const q = item.querySelector('.faq-q') || item.querySelector('.faq-question');
  if (q) q.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// FAQ search
const faqSearch = document.getElementById('faqSearch');
if (faqSearch) {
  faqSearch.addEventListener('input', () => {
    const q = faqSearch.value.toLowerCase();
    document.querySelectorAll('.faq-item').forEach(item => {
      item.style.display = item.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
}

// Topic filter chips
function filterTopic(topic) {
  document.querySelectorAll('.topic-chip').forEach(c => c.classList.remove('active'));
  event.target.classList.add('active');
  document.querySelectorAll('.faq-cat, .faq-category').forEach(cat => {
    if (topic === 'all' || cat.dataset.topic === topic) cat.style.display = '';
    else cat.style.display = 'none';
  });
}

// ===== FLOATING AI CHAT =====
const aiFloatBtn = document.getElementById('aiFloatBtn');
const aiChatPanel = document.getElementById('aiChatPanel');
const aiPanelClose = document.getElementById('aiPanelClose');
const aiPanelSend = document.getElementById('aiPanelSend');
const aiPanelInput = document.getElementById('aiPanelInput');
const aiPanelMessages = document.getElementById('aiPanelMessages');

if (aiFloatBtn && aiChatPanel) {
  aiFloatBtn.addEventListener('click', () => {
    aiChatPanel.classList.toggle('open');
    if (aiChatPanel.classList.contains('open') && aiPanelInput) aiPanelInput.focus();
  });
  if (aiPanelClose) aiPanelClose.addEventListener('click', () => aiChatPanel.classList.remove('open'));
  document.addEventListener('click', (e) => {
    if (aiChatPanel && aiFloatBtn && !aiChatPanel.contains(e.target) && !aiFloatBtn.contains(e.target)) {
      aiChatPanel.classList.remove('open');
    }
  });
}

const aiResponses = {
  automation: "FLYNQN's Rural Room Automation brings smart IoT controls to any home for under ₹900. Click the 'Room Automation' card on the homepage to submit an inquiry!",
  bottle: "The Thermo-Electric Bottle is FLYNQN's patented green energy device that generates power from temperature differences. Click the card to learn more or pre-order!",
  tax: "Our Nomadic Tax Consultancy covers 40+ jurisdictions and is perfect for digital nomads. Click the 'Nomadic Tax Consultancy' card to book a consultation meeting!",
  postpartum: "FLYNQN's Postpartum Support offers live 1-on-1 sessions with certified doctors AND recorded session libraries. Click the card to book a session.",
  price: "Room Automation is priced under ₹900 per room. Tax consultancy and postpartum sessions are priced per session — click any card to see details and book.",
  hello: "Hello! I'm FLYNQN's AI assistant. I can tell you about our Room Automation, Thermo Bottle, Tax Consultancy, or Postpartum Support. What would you like to know?",
  contact: "You can reach FLYNQN at hello@flynq.com or use the contact form at the bottom of the homepage. Our team responds within 4 hours!",
  default: "Great question! For detailed help, scroll down to any innovation card and click it to learn more or get in touch. Or email us at hello@flynq.com!"
};

function getAIResponse(input) {
  const l = input.toLowerCase();
  if (l.includes('hello') || l.includes('hi') || l === 'hey') return aiResponses.hello;
  if (l.includes('automat') || l.includes('room') || l.includes('iot')) return aiResponses.automation;
  if (l.includes('bottle') || l.includes('thermo') || l.includes('energy')) return aiResponses.bottle;
  if (l.includes('tax') || l.includes('nomad') || l.includes('consult')) return aiResponses.tax;
  if (l.includes('postpartum') || l.includes('mother') || l.includes('health') || l.includes('doctor')) return aiResponses.postpartum;
  if (l.includes('price') || l.includes('cost') || l.includes('how much') || l.includes('fee')) return aiResponses.price;
  if (l.includes('contact') || l.includes('email') || l.includes('reach')) return aiResponses.contact;
  return aiResponses.default;
}

function addAIMsg(text, type) {
  if (!aiPanelMessages) return;
  const msg = document.createElement('div');
  msg.className = 'ai-msg ' + type;
  msg.innerHTML = '<div class="ai-bubble">' + text + '</div>';
  aiPanelMessages.appendChild(msg);
  aiPanelMessages.scrollTop = aiPanelMessages.scrollHeight;
}

function sendAI(text) {
  if (!text || !text.trim()) return;
  addAIMsg(text, 'user');
  if (aiPanelInput) aiPanelInput.value = '';
  if (aiChatPanel) aiChatPanel.classList.add('open');
  setTimeout(() => addAIMsg(getAIResponse(text), 'bot'), 700);
}

if (aiPanelSend && aiPanelInput) {
  aiPanelSend.addEventListener('click', () => sendAI(aiPanelInput.value));
  aiPanelInput.addEventListener('keypress', e => { if (e.key === 'Enter') sendAI(aiPanelInput.value); });
}

// ===== POSTPARTUM SHOW/HIDE FORM FUNCTIONS =====
function showPPForm(type) {
  document.getElementById('ppLiveForm').style.display = type === 'live' ? 'block' : 'none';
  document.getElementById('ppRecordedForm').style.display = type === 'recorded' ? 'block' : 'none';
  document.querySelector('.pp-options-grid').style.display = 'none';
  // Scroll modal to top smoothly
  const box = document.querySelector('#modal-postpartum .modal-box');
  if (box) box.scrollTop = 0;
}

function hidePPForms() {
  document.getElementById('ppLiveForm').style.display = 'none';
  document.getElementById('ppRecordedForm').style.display = 'none';
  document.querySelector('.pp-options-grid').style.display = 'grid';
}

// Reset postpartum modal when closed
const ppOverlay = document.getElementById('modal-postpartum');
if (ppOverlay) {
  const origClose = ppOverlay.querySelector('.modal-close');
  if (origClose) {
    origClose.addEventListener('click', () => hidePPForms(), { passive: true });
  }
}

// ===== SESSION / NAVBAR AUTH STATE =====
(function initAuthState() {
  const token = localStorage.getItem('flynqn-token');
  const userRaw = localStorage.getItem('flynqn-user');
  const navCta = document.querySelector('.nav-cta');
  if (!navCta) return;

  if (token && userRaw) {
    try {
      const user = JSON.parse(userRaw);
      // Replace login/signup buttons with user name + logout
      navCta.innerHTML = `
        <span style="color:rgba(255,255,255,0.65);font-family:var(--font);font-size:0.88rem;font-weight:600">👤 ${user.name || 'Account'}</span>
        <button onclick="logoutUser()" class="btn-orange" style="font-size:0.85rem;padding:0.55rem 1.25rem">Logout</button>
      `;
    } catch(e) {
      localStorage.removeItem('flynqn-token');
      localStorage.removeItem('flynqn-user');
    }
  }
})();

function logoutUser() {
  localStorage.removeItem('flynqn-token');
  localStorage.removeItem('flynqn-user');
  localStorage.removeItem('flynqn-login-time');
  window.location.href = '/index.html';
}

// Token expiry check (7 days)
(function checkTokenExpiry() {
  const loginTime = localStorage.getItem('flynqn-login-time');
  if (loginTime) {
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - parseInt(loginTime) > sevenDays) {
      localStorage.removeItem('flynqn-token');
      localStorage.removeItem('flynqn-user');
      localStorage.removeItem('flynqn-login-time');
    }
  }
})();
// ===== AUTH FORMS =====

// LOGIN
submitForm(
  'loginForm',
  '/api/auth/login',
  'Login successful! Redirecting...'
);

// SIGNUP
submitForm(
  'signupForm',
  '/api/auth/signup',
  'Account created successfully!'
);
