// ==========================================
// WEDDING E-INVITATION - MAIN JAVASCRIPT
// ==========================================

// Envelope Opening Animation
function initEnvelope() {
  const overlay = document.getElementById('envelope-overlay');
  const container = document.querySelector('.envelope-container');
  
  if (!overlay || !container) return;
  
  // Play background music when envelope is clicked (if available)
  let musicStarted = false;
  
  container.addEventListener('click', function() {
    // Add opening class to trigger animations
    overlay.classList.add('opening');
    
    // Start background music if available
    if (!musicStarted) {
      const musicPlayer = document.getElementById('music-player');
      if (musicPlayer) {
        musicPlayer.play().catch(e => console.log('Music autoplay prevented:', e));
        musicStarted = true;
      }
    }
    
    // Remove overlay after animation completes
    setTimeout(() => {
      overlay.classList.add('opened');
      
      // Remove from DOM after fade out
      setTimeout(() => {
        overlay.remove();
      }, 800);
    }, 1500);
  });
}

// Custom Cursor
function initCustomCursor() {
  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  document.body.appendChild(cursor);

  let mouseX = 0;
  let mouseY = 0;
  let cursorX = 0;
  let cursorY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.2;
    cursorY += (mouseY - cursorY) * 0.2;
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Hover effect on interactive elements
  const interactiveElements = document.querySelectorAll('a, button, .btn, .card, .gallery-item, input, textarea, select');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });
}

// Animated Background
function initAnimatedBackground() {
  const bgAnimation = document.createElement('div');
  bgAnimation.className = 'bg-animation';
  
  for (let i = 0; i < 5; i++) {
    const shape = document.createElement('div');
    shape.className = 'floating-shape';
    bgAnimation.appendChild(shape);
  }
  
  document.body.prepend(bgAnimation);
}

// Dark Mode Toggle
function initDarkMode() {
  const toggle = document.getElementById('dark-mode-toggle');
  if (!toggle) return;

  // Check saved theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateDarkModeIcon(savedTheme);

  toggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateDarkModeIcon(newTheme);
  });
}

function updateDarkModeIcon(theme) {
  const toggle = document.getElementById('dark-mode-toggle');
  if (!toggle) return;
  toggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// Countdown Timer
function initCountdown() {
  const countdownEl = document.getElementById('countdown');
  if (!countdownEl) return;

  const weddingDate = new Date('2026-12-31T18:00:00').getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = weddingDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    countdownEl.innerHTML = `
      <div class="countdown-item">
        <span class="countdown-value">${days}</span>
        <span class="countdown-label">Days</span>
      </div>
      <div class="countdown-item">
        <span class="countdown-value">${hours}</span>
        <span class="countdown-label">Hours</span>
      </div>
      <div class="countdown-item">
        <span class="countdown-value">${minutes}</span>
        <span class="countdown-label">Minutes</span>
      </div>
      <div class="countdown-item">
        <span class="countdown-value">${seconds}</span>
        <span class="countdown-label">Seconds</span>
      </div>
    `;

    if (distance < 0) {
      countdownEl.innerHTML = '<div class="countdown-item"><span class="countdown-value">💒</span><span class="countdown-label">We\'re Married!</span></div>';
    }
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// Music Player
function initMusicPlayer() {
  const musicPlayer = document.getElementById('music-player');
  const audio = document.getElementById('background-music');
  
  if (!musicPlayer || !audio) return;

  let isPlaying = false;

  musicPlayer.addEventListener('click', () => {
    if (isPlaying) {
      audio.pause();
      musicPlayer.querySelector('.music-icon').textContent = '🎵';
    } else {
      audio.play();
      musicPlayer.querySelector('.music-icon').textContent = '🔊';
    }
    isPlaying = !isPlaying;
  });
}

// Active Nav Link
function setActiveNavLink() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '/' && href === '/')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Smooth Scroll
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// Scroll Reveal Animation
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.card, .section-header, .gallery-item, .story-item, .event-item');
  
  const revealOnScroll = () => {
    revealElements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 100;
      
      if (elementTop < window.innerHeight - elementVisible) {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }
    });
  };
  
  // Initial setup
  revealElements.forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(30px)';
    element.style.transition = 'all 0.6s ease';
  });
  
  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll(); // Run on load
}

// Form Validation
function initFormValidation() {
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form data
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      
      // Basic validation
      let isValid = true;
      const requiredFields = form.querySelectorAll('[required]');
      
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          isValid = false;
          field.style.borderColor = 'red';
        } else {
          field.style.borderColor = '';
        }
      });
      
      if (isValid) {
        // Submit form
        submitForm(form, data);
      } else {
        showNotification('Please fill in all required fields', 'error');
      }
    });
  });
}

// Submit Form
async function submitForm(form, data) {
  const action = form.getAttribute('action');
  const method = form.getAttribute('method') || 'POST';
  
  try {
    const response = await fetch(action, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      showNotification(result.message || 'Success!', 'success');
      form.reset();
    } else {
      showNotification(result.error || 'Something went wrong', 'error');
    }
  } catch (error) {
    showNotification('Network error. Please try again.', 'error');
  }
}

// Show Notification
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Gallery Lightbox
function initGallery() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  galleryItems.forEach(item => {
    item.addEventListener('click', function() {
      const img = this.querySelector('img');
      if (img) {
        showLightbox(img.src);
      }
    });
  });
}

function showLightbox(imageSrc) {
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <div class="lightbox-content">
      <img src="${imageSrc}" alt="Gallery image">
      <button class="lightbox-close">&times;</button>
    </div>
  `;
  
  document.body.appendChild(lightbox);
  
  setTimeout(() => {
    lightbox.style.opacity = '1';
  }, 10);
  
  lightbox.querySelector('.lightbox-close').addEventListener('click', () => {
    lightbox.style.opacity = '0';
    setTimeout(() => {
      lightbox.remove();
    }, 300);
  });
  
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      lightbox.style.opacity = '0';
      setTimeout(() => {
        lightbox.remove();
      }, 300);
    }
  });
}

// Load Messages
async function loadMessages() {
  const messagesList = document.querySelector('.messages-list');
  if (!messagesList) return;
  
  try {
    const response = await fetch('/api/messages');
    const messages = await response.json();
    
    if (messages.length === 0) {
      messagesList.innerHTML = '<p class="text-center" style="color: var(--color-muted);">No messages yet. Be the first to leave a message!</p>';
      return;
    }
    
    messagesList.innerHTML = messages.map(msg => `
      <div class="message-item">
        <div class="message-header">
          <span class="message-name">${escapeHtml(msg.name)}</span>
          <span class="message-date">${formatDate(msg.created_at)}</span>
        </div>
        <p class="message-text">${escapeHtml(msg.message)}</p>
      </div>
    `).join('');
  } catch (error) {
    messagesList.innerHTML = '<p class="text-center" style="color: red;">Failed to load messages</p>';
  }
}

// Utility Functions
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', function() {
  initEnvelope();
  initCustomCursor();
  initAnimatedBackground();
  initDarkMode();
  initCountdown();
  initMusicPlayer();
  setActiveNavLink();
  initSmoothScroll();
  initScrollReveal();
  initFormValidation();
  initGallery();
  loadMessages();
});

// Add Lightbox Styles Dynamically
const lightboxStyles = `
  .lightbox {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .lightbox-content {
    position: relative;
    max-width: 90%;
    max-height: 90%;
  }
  
  .lightbox-content img {
    max-width: 100%;
    max-height: 90vh;
    border-radius: var(--radius-lg);
  }
  
  .lightbox-close {
    position: absolute;
    top: -40px;
    right: 0;
    background: none;
    border: none;
    color: white;
    font-size: 3rem;
    cursor: pointer;
    line-height: 1;
  }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = lightboxStyles;
document.head.appendChild(styleSheet);
