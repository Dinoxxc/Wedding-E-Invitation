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
  await Promise.all([loadRSVPs(), loadMessages()]);
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

document.addEventListener('DOMContentLoaded', initAdmin);
