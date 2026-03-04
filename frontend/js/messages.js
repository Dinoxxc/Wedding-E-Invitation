// ==========================================
// MESSAGES HANDLER
// ==========================================

function initMessages() {
  loadMessages();
  initMessageForm();
}

async function loadMessages() {
  const messagesContainer = document.getElementById('messages-list');
  if (!messagesContainer) return;

  const { apiRequest, escapeHtml, formatDate } = window.WeddingApp;

  try {
    const response = await apiRequest('/messages');
    
    if (response.success && response.data.length > 0) {
      messagesContainer.innerHTML = response.data.map(message => `
        <div class="message-card scroll-reveal">
          <div class="message-author">${escapeHtml(message.guest_name)}</div>
          <div class="message-text">${escapeHtml(message.message)}</div>
          <div class="message-date">${formatDate(message.created_at)}</div>
        </div>
      `).join('');
    } else {
      messagesContainer.innerHTML = `
        <div class="text-center" style="padding: 3rem; color: var(--color-muted);">
          <p>No messages yet. Be the first to leave a message!</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('Failed to load messages:', error);
    messagesContainer.innerHTML = `
      <div class="text-center" style="padding: 3rem; color: var(--color-muted);">
        <p>Unable to load messages at this time.</p>
      </div>
    `;
  }
}

function initMessageForm() {
  const form = document.getElementById('message-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const { setButtonLoading, showNotification, apiRequest } = window.WeddingApp;

    const formData = {
      guest_name: form.guest_name.value.trim(),
      message: form.message.value.trim()
    };

    // Validation
    if (!formData.guest_name) {
      showNotification('Please enter your name', 'error');
      return;
    }

    if (!formData.message || formData.message.length < 5) {
      showNotification('Please enter a message (at least 5 characters)', 'error');
      return;
    }

    if (formData.message.length > 500) {
      showNotification('Message is too long (maximum 500 characters)', 'error');
      return;
    }

    setButtonLoading(submitBtn, true);

    try {
      const response = await apiRequest('/messages', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      if (response.success) {
        showNotification('Thank you! Your message has been posted.', 'success');
        form.reset();
        
        // Reload messages
        setTimeout(() => {
          loadMessages();
        }, 500);
      }
    } catch (error) {
      showNotification(error.message || 'Failed to post message. Please try again.', 'error');
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });

  // Character counter
  const messageTextarea = form.message;
  const charCount = document.getElementById('char-count');
  
  if (messageTextarea && charCount) {
    messageTextarea.addEventListener('input', () => {
      const length = messageTextarea.value.length;
      charCount.textContent = `${length}/500`;
      
      if (length > 500) {
        charCount.style.color = '#d32f2f';
      } else {
        charCount.style.color = 'var(--color-muted)';
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', initMessages);
