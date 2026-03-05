const express = require('express');
const router = express.Router();
const RSVP = require('../models/rsvp');
const { validateRSVP, sanitizeInput } = require('../middleware/validation');
const emailService = require('../config/email');
const logger = require('../config/logger');

// Submit RSVP
router.post('/', validateRSVP, async (req, res) => {
  try {
    // Sanitize inputs
    const sanitizedData = {
      guest_name: sanitizeInput(req.body.guest_name),
      email: sanitizeInput(req.body.email),
      phone: req.body.phone ? sanitizeInput(req.body.phone) : null,
      attendance: req.body.attendance,
      number_of_guests: parseInt(req.body.number_of_guests) || 1,
      dietary_restrictions: req.body.dietary_restrictions ? sanitizeInput(req.body.dietary_restrictions) : null,
      special_requests: req.body.special_requests ? sanitizeInput(req.body.special_requests) : null
    };

    // Check if email already exists
    const existing = await RSVP.findByEmail(sanitizedData.email);
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'An RSVP with this email already exists. Please contact us to make changes.' 
      });
    }

    const rsvpId = await RSVP.create(sanitizedData);
    
    // Send confirmation email (non-blocking)
    emailService.sendRSVPConfirmation(sanitizedData)
      .then(result => {
        if (result.success) {
          logger.info(`RSVP confirmation email sent to ${sanitizedData.email}`);
        } else {
          logger.error(`Failed to send RSVP confirmation email to ${sanitizedData.email}`);
        }
      })
      .catch(err => {
        logger.error('Email sending error:', err);
      });
    
    res.status(201).json({
      success: true,
      message: 'RSVP submitted successfully! Check your email for confirmation.',
      data: { id: rsvpId }
    });
  } catch (error) {
    logger.error('RSVP submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit RSVP. Please try again later.'
    });
  }
});

// Get RSVP by email (for guests to check their RSVP)
router.get('/check/:email', async (req, res) => {
  try {
    const rsvp = await RSVP.findByEmail(req.params.email);
    
    if (!rsvp) {
      return res.status(404).json({
        success: false,
        message: 'No RSVP found for this email'
      });
    }

    res.json({
      success: true,
      data: rsvp
    });
  } catch (error) {
    logger.error('RSVP check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check RSVP'
    });
  }
});

module.exports = router;
