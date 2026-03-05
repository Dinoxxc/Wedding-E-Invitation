// ==========================================
// ADMIN PANEL
// ==========================================

let authToken = localStorage.getItem('adminToken');

function initAdmin() {
  if (!authToken) {
    showLoginForm();
  } else {
    loadAdminData();
  }

  initLoginForm();
}

function showLoginForm() {
  document.getElementById('login-section').style.display = 'block';
  document.getElementById('admin-dashboard').style.display = 'none';
}

function showDashboard() {
  document.getElementById('login-section').style.display = 'none';
  document.getElementById('admin-dashboard').style.display = 'block';
}

function initLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const { setButtonLoading, showNotification, apiRequest } = window.WeddingApp;
    const submitBtn = form.querySelector('button[type="submit"]');

    const credentials = {
      username: form.username.value.trim(),
      password: form.password.value
    };

    setButtonLoading(submitBtn, true);

    try {
      const response = await apiRequest('/admin/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });

      if (response.success) {
        authToken = response.data.token;
        localStorage.setItem('adminToken', authToken);
        showNotification('Login successful!', 'success');
        showDashboard();
        loadAdminData();
      }
    } catch (error) {
      showNotification(error.message || 'Login failed. Check your credentials.', 'error');
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
}

async function loadAdminData() {
  showDashboard();
  await Promise.all([
    loadRSVPs(), 
    loadMessages(), 
    loadGuestList(), 
    loadPhotos(), 
    loadGifts(), 
    loadSeating()
  ]);
}

async function loadRSVPs() {
  const { apiRequest, escapeHtml, formatDate, showNotification } = window.WeddingApp;
  const container = document.getElementById('rsvp-list');
  const statsContainer = document.getElementById('rsvp-stats');

  try {
    const response = await apiRequest('/admin/rsvps', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.success) {
      const { rsvps, stats } = response.data;

      // Update stats
      statsContainer.innerHTML = `
        <div class="stat-card">
          <div class="stat-number">${stats.total_responses || 0}</div>
          <div class="stat-label">Total Responses</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${stats.attending_count || 0}</div>
          <div class="stat-label">Attending</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${stats.not_attending_count || 0}</div>
          <div class="stat-label">Not Attending</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${stats.total_guests || 0}</div>
          <div class="stat-label">Total Guests</div>
        </div>
      `;

      // Update RSVPs list
      if (rsvps.length > 0) {
        container.innerHTML = `
          <table class="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Guests</th>
                <th>Dietary</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${rsvps.map(rsvp => `
                <tr>
                  <td>${escapeHtml(rsvp.guest_name)}</td>
                  <td>${escapeHtml(rsvp.email)}</td>
                  <td>${escapeHtml(rsvp.phone || '-')}</td>
                  <td>
                    <span class="badge ${rsvp.attendance === 'attending' ? 'badge-success' : 'badge-danger'}">
                      ${rsvp.attendance === 'attending' ? 'Attending' : 'Not Attending'}
                    </span>
                  </td>
                  <td>${rsvp.number_of_guests || 1}</td>
                  <td>${escapeHtml(rsvp.dietary_restrictions || '-')}</td>
                  <td style="font-size: 0.75rem;">${new Date(rsvp.created_at).toLocaleDateString()}</td>
                  <td>
                    <button onclick="deleteRSVP(${rsvp.id})" class="btn-delete">Delete</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      } else {
        container.innerHTML = '<p style="text-align: center; color: var(--color-muted); padding: 2rem;">No RSVPs yet.</p>';
      }
    }
  } catch (error) {
    if (error.message.includes('Authentication') || error.message.includes('token')) {
      logout();
    } else {
      showNotification('Failed to load RSVPs', 'error');
    }
  }
}

async function loadMessages() {
  const { apiRequest, escapeHtml, formatDate, showNotification } = window.WeddingApp;
  const container = document.getElementById('messages-admin-list');

  try {
    const response = await apiRequest('/admin/messages', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.success && response.data.length > 0) {
      container.innerHTML = `
        <table class="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Message</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${response.data.map(msg => `
              <tr>
                <td>${escapeHtml(msg.guest_name)}</td>
                <td style="max-width: 300px;">${escapeHtml(msg.message)}</td>
                <td>
                  <span class="badge ${msg.approved ? 'badge-success' : 'badge-warning'}">
                    ${msg.approved ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td style="font-size: 0.75rem;">${new Date(msg.created_at).toLocaleDateString()}</td>
                <td>
                  ${!msg.approved ? `<button onclick="approveMessage(${msg.id})" class="btn-approve">Approve</button>` : ''}
                  <button onclick="deleteMessage(${msg.id})" class="btn-delete">Delete</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else {
      container.innerHTML = '<p style="text-align: center; color: var(--color-muted); padding: 2rem;">No messages yet.</p>';
    }
  } catch (error) {
    if (error.message.includes('Authentication') || error.message.includes('token')) {
      logout();
    } else {
      showNotification('Failed to load messages', 'error');
    }
  }
}

async function deleteRSVP(id) {
  if (!confirm('Are you sure you want to delete this RSVP?')) return;

  const { apiRequest, showNotification } = window.WeddingApp;

  try {
    await apiRequest(`/admin/rsvps/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    showNotification('RSVP deleted successfully', 'success');
    loadRSVPs();
  } catch (error) {
    showNotification('Failed to delete RSVP', 'error');
  }
}

async function approveMessage(id) {
  const { apiRequest, showNotification } = window.WeddingApp;

  try {
    await apiRequest(`/admin/messages/${id}/approve`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    showNotification('Message approved', 'success');
    loadMessages();
  } catch (error) {
    showNotification('Failed to approve message', 'error');
  }
}

async function deleteMessage(id) {
  if (!confirm('Are you sure you want to delete this message?')) return;

  const { apiRequest, showNotification } = window.WeddingApp;

  try {
    await apiRequest(`/admin/messages/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    showNotification('Message deleted successfully', 'success');
    loadMessages();
  } catch (error) {
    showNotification('Failed to delete message', 'error');
  }
}

function logout() {
  localStorage.removeItem('adminToken');
  authToken = null;
  showLoginForm();
}

// ==========================================
// TAB SWITCHING
// ==========================================
function switchTab(tabName, event) {
  // Hide all tab contents
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Remove active class from all tabs
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Show selected tab
  document.getElementById('tab-' + tabName).classList.add('active');
  
  // Add active class to clicked tab
  if (event && event.target) {
    event.target.classList.add('active');
  } else {
    // Fallback: find and activate the tab by data attribute or text
    document.querySelectorAll('.admin-tab').forEach(tab => {
      if (tab.getAttribute('onclick').includes(tabName)) {
        tab.classList.add('active');
      }
    });
  }
  
  // Load data if needed
  if (tabName === 'analytics') {
    loadAnalytics();
  }
}

// ==========================================
// GUEST LIST MANAGEMENT
// ==========================================
async function loadGuestList() {
  const { apiRequest, escapeHtml, showNotification } = window.WeddingApp;
  const container = document.getElementById('guestlist-list');

  try {
    const response = await apiRequest('/guestlist', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.success && response.data.guests && response.data.guests.length > 0) {
      const guests = response.data.guests;
      container.innerHTML = `
        <table class="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Type</th>
              <th>Max Guests</th>
              <th>QR Code</th>
              <th>Check-in</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${guests.map(guest => `
              <tr>
                <td>${escapeHtml(guest.name)}</td>
                <td>${escapeHtml(guest.email || '-')}</td>
                <td>${escapeHtml(guest.phone || '-')}</td>
                <td><span class="badge ${guest.invitation_type === 'VIP' ? 'badge-success' : 'badge-warning'}">${escapeHtml(guest.invitation_type)}</span></td>
                <td>${guest.max_guests || 1}</td>
                <td>
                  ${guest.qr_code ? `<a href="${guest.qr_code}" target="_blank" class="btn-action btn-secondary">View QR</a>` : `<span style="color: var(--color-muted); font-size: 0.75rem;">No QR</span>`}
                </td>
                <td>
                  ${guest.checked_in ? '<span class="badge badge-success">Yes</span>' : '<span class="badge badge-warning">No</span>'}
                </td>
                <td>
                  <button onclick="sendInvitation(${guest.id})" class="btn-action btn-secondary">Send Invite</button>
                  <button onclick="deleteGuest(${guest.id})" class="btn-delete">Delete</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else {
      container.innerHTML = '<p style="text-align: center; color: var(--color-muted); padding: 2rem;">No guests yet.</p>';
    }
  } catch (error) {
    console.error('Load guest list error:', error);
    showNotification('Failed to load guest list', 'error');
    container.innerHTML = '<p style="text-align: center; color: red; padding: 2rem;">Failed to load guest list</p>';
  }
}

function showAddGuestForm() {
  document.getElementById('add-guest-form').style.display = 'block';
}

function hideAddGuestForm() {
  document.getElementById('add-guest-form').style.display = 'none';
  document.getElementById('guest-form').reset();
}

// Initialize guest form submission
document.addEventListener('DOMContentLoaded', function() {
  const guestForm = document.getElementById('guest-form');
  if (guestForm) {
    guestForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const { apiRequest, showNotification } = window.WeddingApp;

      const formData = new FormData(guestForm);
      const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        invitation_type: formData.get('invitation_type'),
        max_guests: parseInt(formData.get('max_guests')) || 1
      };

      try {
        await apiRequest('/guestlist', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        showNotification('Guest added successfully', 'success');
        hideAddGuestForm();
        loadGuestList();
      } catch (error) {
        console.error('Add guest error:', error);
        showNotification('Failed to add guest', 'error');
      }
    });
  }
});

async function deleteGuest(id) {
  if (!confirm('Are you sure you want to delete this guest?')) return;

  const { apiRequest, showNotification } = window.WeddingApp;

  try {
    await apiRequest(`/guestlist/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    showNotification('Guest deleted successfully', 'success');
    loadGuestList();
  } catch (error) {
    showNotification('Failed to delete guest', 'error');
  }
}

async function sendInvitation(guestId) {
  const { apiRequest, showNotification, setButtonLoading } = window.WeddingApp;

  try {
    await apiRequest(`/notifications/invitation/${guestId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    showNotification('Invitation sent successfully', 'success');
  } catch (error) {
    showNotification('Failed to send invitation', 'error');
  }
}

// ==========================================
// PHOTO MANAGEMENT
// ==========================================
async function loadPhotos() {
  const { apiRequest, escapeHtml, showNotification } = window.WeddingApp;
  const container = document.getElementById('photos-list');

  try {
    const response = await apiRequest('/photos/admin/all', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.success && response.data && response.data.length > 0) {
      container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.5rem;">
          ${response.data.map(photo => `
            <div style="border: 1px solid var(--color-border); padding: 1rem;">
              <img src="${photo.path}" alt="Photo" style="width: 100%; height: 200px; object-fit: cover; margin-bottom: 1rem;" onerror="this.src='https://via.placeholder.com/250x200?text=No+Image'">
              <p style="font-size: 0.875rem; margin-bottom: 0.5rem;">
                <strong>Uploaded by:</strong> ${escapeHtml(photo.uploaded_by || 'Guest')}
              </p>
              <p style="font-size: 0.875rem; margin-bottom: 1rem;">
                ${photo.caption ? escapeHtml(photo.caption) : 'No caption'}
              </p>
              <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                ${!photo.approved ? `<button onclick="approvePhoto(${photo.id})" class="btn-approve">Approve</button>` : '<span class="badge badge-success">Approved</span>'}
                <button onclick="deletePhoto(${photo.id})" class="btn-delete">Delete</button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      container.innerHTML = '<p style="text-align: center; color: var(--color-muted); padding: 2rem;">No photos yet.</p>';
    }
  } catch (error) {
    console.error('Load photos error:', error);
    showNotification('Failed to load photos', 'error');
    container.innerHTML = '<p style="text-align: center; color: red; padding: 2rem;">Failed to load photos</p>';
  }
}

async function approvePhoto(id) {
  const { apiRequest, showNotification } = window.WeddingApp;

  try {
    await apiRequest(`/photos/${id}/approve`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    showNotification('Photo approved', 'success');
    loadPhotos();
  } catch (error) {
    showNotification('Failed to approve photo', 'error');
  }
}

async function deletePhoto(id) {
  if (!confirm('Are you sure you want to delete this photo?')) return;

  const { apiRequest, showNotification } = window.WeddingApp;

  try {
    await apiRequest(`/photos/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    showNotification('Photo deleted successfully', 'success');
    loadPhotos();
  } catch (error) {
    showNotification('Failed to delete photo', 'error');
  }
}

// ==========================================
// GIFT TRACKING
// ==========================================
async function loadGifts() {
  const { apiRequest, escapeHtml, showNotification } = window.WeddingApp;
  const container = document.getElementById('gifts-list');
  const statsContainer = document.getElementById('gift-stats');

  try {
    const response = await apiRequest('/gifts', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    // Update stats
    if (response.success && response.data && response.data.stats) {
      const stats = response.data.stats;
      statsContainer.innerHTML = `
        <div class="stat-card">
          <div class="stat-number">${stats.total_gifts || 0}</div>
          <div class="stat-label">Total Gifts</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">Rp ${parseFloat(stats.total_cash || 0).toLocaleString()}</div>
          <div class="stat-label">Total Cash</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${stats.cash_gifts || 0}</div>
          <div class="stat-label">Cash Gifts</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${stats.physical_gifts || 0}</div>
          <div class="stat-label">Physical Gifts</div>
        </div>
      `;
    }

    // Update gifts list
    if (response.success && response.data && response.data.gifts && response.data.gifts.length > 0) {
      container.innerHTML = `
        <table class="admin-table">
          <thead>
            <tr>
              <th>Guest Name</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Description</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${response.data.gifts.map(gift => `
              <tr>
                <td>${escapeHtml(gift.guest_name)}</td>
                <td><span class="badge ${gift.gift_type === 'cash' ? 'badge-success' : 'badge-warning'}">${gift.gift_type}</span></td>
                <td>${gift.amount ? 'Rp ' + parseFloat(gift.amount).toLocaleString() : '-'}</td>
                <td>${escapeHtml(gift.description || '-')}</td>
                <td style="font-size: 0.75rem;">${new Date(gift.created_at).toLocaleDateString()}</td>
                <td>
                  <button onclick="deleteGift(${gift.id})" class="btn-delete">Delete</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else {
      container.innerHTML = '<p style="text-align: center; color: var(--color-muted); padding: 2rem;">No gifts recorded yet.</p>';
    }
  } catch (error) {
    console.error('Load gifts error:', error);
    showNotification('Failed to load gifts', 'error');
    container.innerHTML = '<p style="text-align: center; color: red; padding: 2rem;">Failed to load gifts</p>';
  }
}

function showAddGiftForm() {
  document.getElementById('add-gift-form').style.display = 'block';
}

function hideAddGiftForm() {
  document.getElementById('add-gift-form').style.display = 'none';
  document.getElementById('gift-form').reset();
}

// Initialize gift form submission
document.addEventListener('DOMContentLoaded', function() {
  const giftForm = document.getElementById('gift-form');
  if (giftForm) {
    giftForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const { apiRequest, showNotification } = window.WeddingApp;

      const formData = new FormData(giftForm);
      const data = {
        guest_name: formData.get('guest_name'),
        gift_type: formData.get('gift_type'),
        amount: parseFloat(formData.get('amount')) || null,
        description: formData.get('description')
      };

      try {
        await apiRequest('/gifts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        showNotification('Gift recorded successfully', 'success');
        hideAddGiftForm();
        loadGifts();
      } catch (error) {
        showNotification('Failed to record gift', 'error');
      }
    });
  }
});

async function deleteGift(id) {
  if (!confirm('Are you sure you want to delete this gift record?')) return;

  const { apiRequest, showNotification } = window.WeddingApp;

  try {
    await apiRequest(`/gifts/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    showNotification('Gift deleted successfully', 'success');
    loadGifts();
  } catch (error) {
    showNotification('Failed to delete gift', 'error');
  }
}

// ==========================================
// SEATING ARRANGEMENT
// ==========================================
async function loadSeating() {
  const { apiRequest, escapeHtml, showNotification } = window.WeddingApp;
  const container = document.getElementById('seating-list');

  try {
    const response = await apiRequest('/seating', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.success && response.data.tables && response.data.tables.length > 0) {
      const tables = response.data.tables;
      container.innerHTML = `
        <table class="admin-table">
          <thead>
            <tr>
              <th>Table Number</th>
              <th>Table Name</th>
              <th>Capacity</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${tables.map(table => `
              <tr>
                <td><strong>${table.table_number}</strong></td>
                <td>${escapeHtml(table.table_name || '-')}</td>
                <td>${table.capacity}</td>
                <td>${escapeHtml(table.notes || '-')}</td>
                <td>
                  <button onclick="deleteTable(${table.id})" class="btn-delete">Delete</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else {
      container.innerHTML = '<p style="text-align: center; color: var(--color-muted); padding: 2rem;">No tables created yet.</p>';
    }
  } catch (error) {
    console.error('Load seating error:', error);
    showNotification('Failed to load seating arrangement', 'error');
    container.innerHTML = '<p style="text-align: center; color: red; padding: 2rem;">Failed to load seating arrangement</p>';
  }
}

function showAddTableForm() {
  document.getElementById('add-table-form').style.display = 'block';
}

function hideAddTableForm() {
  document.getElementById('add-table-form').style.display = 'none';
  document.getElementById('table-form').reset();
}

// Initialize table form submission
document.addEventListener('DOMContentLoaded', function() {
  const tableForm = document.getElementById('table-form');
  if (tableForm) {
    tableForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const { apiRequest, showNotification } = window.WeddingApp;

      const formData = new FormData(tableForm);
      const data = {
        table_number: parseInt(formData.get('table_number')),
        table_name: formData.get('table_name'),
        capacity: parseInt(formData.get('capacity')),
        notes: formData.get('notes')
      };

      try {
        await apiRequest('/seating', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        showNotification('Table added successfully', 'success');
        hideAddTableForm();
        loadSeating();
      } catch (error) {
        console.error('Add table error:', error);
        showNotification('Failed to add table', 'error');
      }
    });
  }
});

async function deleteTable(id) {
  if (!confirm('Are you sure you want to delete this table?')) return;

  const { apiRequest, showNotification } = window.WeddingApp;

  try {
    await apiRequest(`/seating/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    showNotification('Table deleted successfully', 'success');
    loadSeating();
  } catch (error) {
    showNotification('Failed to delete table', 'error');
  }
}

function assignGuests(tableId) {
  const { showNotification } = window.WeddingApp;
  showNotification('Guest assignment feature coming soon!', 'success');
  // TODO: Implement guest assignment modal
}

// ==========================================
// NOTIFICATIONS
// ==========================================
// Initialize notification forms
document.addEventListener('DOMContentLoaded', function() {
  const emailForm = document.getElementById('email-notification-form');
  const smsForm = document.getElementById('sms-notification-form');

  if (emailForm) {
    emailForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const { apiRequest, showNotification } = window.WeddingApp;

      const formData = new FormData(emailForm);
      const data = {
        type: formData.get('type'),
        recipients: formData.get('recipients')
      };

      try {
        await apiRequest(`/notifications/${data.type}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ filter: data.recipients })
        });

        showNotification('Email notifications sent successfully', 'success');
        emailForm.reset();
      } catch (error) {
        showNotification('Failed to send email notifications', 'error');
      }
    });
  }

  if (smsForm) {
    smsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const { showNotification } = window.WeddingApp;
      
      showNotification('SMS feature requires Twilio configuration', 'success');
      // TODO: Implement SMS sending when Twilio is configured
    });
  }
});

// ==========================================
// ANALYTICS
// ==========================================
async function loadAnalytics() {
  const { apiRequest, showNotification } = window.WeddingApp;
  const container = document.getElementById('analytics-content');

  try {
    const response = await apiRequest('/analytics', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.success) {
      const data = response.data;
      
      container.innerHTML = `
        <div class="stat-grid" style="margin-bottom: 2rem;">
          <div class="stat-card">
            <div class="stat-number">${data.overview.total_guests || 0}</div>
            <div class="stat-label">Total Guests</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${data.overview.rsvp_responses || 0}</div>
            <div class="stat-label">RSVP Responses</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${data.overview.attending_count || 0}</div>
            <div class="stat-label">Attending</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${data.overview.checked_in || 0}</div>
            <div class="stat-label">Checked In</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${data.overview.total_photos || 0}</div>
            <div class="stat-label">Photos Uploaded</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${data.overview.total_gifts || 0}</div>
            <div class="stat-label">Gifts Received</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2rem;">
          <div style="border: 1px solid var(--color-border); padding: 1.5rem;">
            <h3 style="margin-bottom: 1rem;">Guest Categories</h3>
            ${data.guests_by_category.length > 0 ? `
              <table class="admin-table">
                <thead>
                  <tr><th>Category</th><th>Count</th></tr>
                </thead>
                <tbody>
                  ${data.guests_by_category.map(cat => `
                    <tr><td>${cat.category}</td><td>${cat.count}</td></tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p style="text-align: center; color: var(--color-muted);">No data</p>'}
          </div>

          <div style="border: 1px solid var(--color-border); padding: 1.5rem;">
            <h3 style="margin-bottom: 1rem;">Gift Statistics</h3>
            ${data.gift_statistics ? `
              <p><strong>Total Cash:</strong> Rp ${(data.gift_statistics.total_cash || 0).toLocaleString()}</p>
              <p><strong>Cash Gifts:</strong> ${data.gift_statistics.cash_gifts || 0}</p>
              <p><strong>Physical Gifts:</strong> ${data.gift_statistics.physical_gifts || 0}</p>
            ` : '<p style="text-align: center; color: var(--color-muted);">No data</p>'}
          </div>
        </div>
      `;
    }
  } catch (error) {
    showNotification('Failed to load analytics', 'error');
  }
}

async function exportAnalytics() {
  const { apiRequest, showNotification } = window.WeddingApp;

  try {
    window.open(`/api/analytics/export?token=${authToken}`, '_blank');
    showNotification('Exporting analytics to CSV...', 'success');
  } catch (error) {
    showNotification('Failed to export analytics', 'error');
  }
}

document.addEventListener('DOMContentLoaded', initAdmin);
