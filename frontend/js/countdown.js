// ==========================================
// COUNTDOWN TIMER
// ==========================================

function initCountdown() {
  const countdownElement = document.getElementById('countdown');
  
  if (!countdownElement) return;

  // Get wedding date from data attribute or use default
  const weddingDateStr = countdownElement.dataset.date || '2026-12-31T18:00:00';
  const weddingDate = new Date(weddingDateStr).getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = weddingDate - now;

    if (distance < 0) {
      countdownElement.innerHTML = `
        <div class="countdown-item">
          <span class="countdown-number">🎊</span>
          <span class="countdown-label">We're Married!</span>
        </div>
      `;
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    countdownElement.innerHTML = `
      <div class="countdown-item">
        <span class="countdown-number">${days}</span>
        <span class="countdown-label">Days</span>
      </div>
      <div class="countdown-item">
        <span class="countdown-number">${hours}</span>
        <span class="countdown-label">Hours</span>
      </div>
      <div class="countdown-item">
        <span class="countdown-number">${minutes}</span>
        <span class="countdown-label">Minutes</span>
      </div>
      <div class="countdown-item">
        <span class="countdown-number">${seconds}</span>
        <span class="countdown-label">Seconds</span>
      </div>
    `;
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

document.addEventListener('DOMContentLoaded', initCountdown);
