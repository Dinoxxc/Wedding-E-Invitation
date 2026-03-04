// ==========================================
// RSVP FORM HANDLER
// ==========================================

function initRSVPForm() {
  const form = document.getElementById('rsvp-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const { setButtonLoading, showNotification, validateEmail, apiRequest } = window.WeddingApp;

    // Get form data
    const formData = {
      guest_name: form.guest_name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      attendance: form.attendance.value,
      number_of_guests: parseInt(form.number_of_guests.value) || 1,
      dietary_restrictions: form.dietary_restrictions.value.trim(),
      special_requests: form.special_requests.value.trim()
    };

    // Client-side validation
    if (!formData.guest_name) {
      showNotification('Please enter your name', 'error');
      return;
    }

    if (!formData.email || !validateEmail(formData.email)) {
      showNotification('Please enter a valid email address', 'error');
      return;
    }

    if (!formData.attendance) {
      showNotification('Please select your attendance status', 'error');
      return;
    }

    // Submit to backend
    setButtonLoading(submitBtn, true);

    try {
      const response = await apiRequest('/rsvp', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      if (response.success) {
        showNotification('Thank you! Your RSVP has been submitted successfully.', 'success');
        form.reset();
        
        // Show success message
        setTimeout(() => {
          document.getElementById('form-container').style.display = 'none';
          document.getElementById('success-message').style.display = 'block';
        }, 1000);
      }
    } catch (error) {
      showNotification(error.message || 'Failed to submit RSVP. Please try again.', 'error');
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });

  // Show/hide number of guests based on attendance
  const attendanceInputs = form.querySelectorAll('input[name="attendance"]');
  const guestsGroup = document.getElementById('guests-group');

  attendanceInputs.forEach(input => {
    input.addEventListener('change', () => {
      if (input.value === 'attending') {
        guestsGroup.style.display = 'block';
      } else {
        guestsGroup.style.display = 'none';
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', initRSVPForm);
