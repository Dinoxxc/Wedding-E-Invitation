function validateRSVP(req, res, next) {
  const { guest_name, email, attendance } = req.body;

  const errors = [];

  if (!guest_name || guest_name.trim().length === 0) {
    errors.push('Guest name is required');
  }

  if (!email || !isValidEmail(email)) {
    errors.push('Valid email is required');
  }

  if (!attendance || !['attending', 'not_attending'].includes(attendance)) {
    errors.push('Attendance status must be either "attending" or "not_attending"');
  }

  if (req.body.number_of_guests) {
    const num = parseInt(req.body.number_of_guests);
    if (isNaN(num) || num < 1 || num > 10) {
      errors.push('Number of guests must be between 1 and 10');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
}

function validateMessage(req, res, next) {
  const { guest_name, message } = req.body;

  const errors = [];

  if (!guest_name || guest_name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (!message || message.trim().length === 0) {
    errors.push('Message is required');
  }

  if (message && message.length > 500) {
    errors.push('Message must not exceed 500 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Sanitize input to prevent XSS
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

module.exports = {
  validateRSVP,
  validateMessage,
  sanitizeInput
};
