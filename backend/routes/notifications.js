const express = require('express');
const router = express.Router();
const path = require('path');
const authenticateAdmin = require('../middleware/auth');
const emailService = require('../config/email');
const GuestList = require('../models/guestlist');
const logger = require('../config/logger');

// Send invitation to specific guest (admin only)
router.post('/send-invitation/:guestId', authenticateAdmin, async (req, res) => {
  try {
    const guest = await GuestList.findById(req.params.guestId);
    
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found'
      });
    }

    if (!guest.email) {
      return res.status(400).json({
        success: false,
        message: 'Guest has no email address'
      });
    }

    const qrCodePath = guest.qr_code ? path.join(__dirname, '../..', guest.qr_code) : null;
    const result = await emailService.sendGuestInvitation(guest, qrCodePath);

    if (result.success) {
      logger.info(`Invitation sent to ${guest.name} (${guest.email})`);
      res.json({
        success: true,
        message: 'Invitation sent successfully'
      });
    } else {
      logger.error(`Failed to send invitation to ${guest.email}`, { error: result.error });
      res.status(500).json({
        success: false,
        message: 'Failed to send invitation'
      });
    }
  } catch (error) {
    logger.error('Send invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send invitation'
    });
  }
});

// Send bulk invitations (admin only)
router.post('/send-bulk-invitations', authenticateAdmin, async (req, res) => {
  try {
    const { guestIds } = req.body;

    if (!Array.isArray(guestIds) || guestIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid guest IDs'
      });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (const guestId of guestIds) {
      const guest = await GuestList.findById(guestId);
      
      if (!guest || !guest.email) {
        results.failed++;
        results.errors.push({ guestId, reason: 'Guest not found or no email' });
        continue;
      }

      const qrCodePath = guest.qr_code ? path.join(__dirname, '../..', guest.qr_code) : null;
      const result = await emailService.sendGuestInvitation(guest, qrCodePath);

      if (result.success) {
        results.success++;
      } else {
        results.failed++;
        results.errors.push({ guestId, email: guest.email, error: result.error });
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    logger.info(`Bulk invitations sent: ${results.success} success, ${results.failed} failed`);

    res.json({
      success: true,
      message: 'Bulk invitations completed',
      data: results
    });
  } catch (error) {
    logger.error('Send bulk invitations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send bulk invitations'
    });
  }
});

// Send reminder to specific guest (admin only)
router.post('/send-reminder/:guestId', authenticateAdmin, async (req, res) => {
  try {
    const guest = await GuestList.findById(req.params.guestId);
    
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found'
      });
    }

    if (!guest.email) {
      return res.status(400).json({
        success: false,
        message: 'Guest has no email address'
      });
    }

    const result = await emailService.sendWeddingReminder(guest);

    if (result.success) {
      logger.info(`Reminder sent to ${guest.name} (${guest.email})`);
      res.json({
        success: true,
        message: 'Reminder sent successfully'
      });
    } else {
      logger.error(`Failed to send reminder to ${guest.email}`, { error: result.error });
      res.status(500).json({
        success: false,
        message: 'Failed to send reminder'
      });
    }
  } catch (error) {
    logger.error('Send reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reminder'
    });
  }
});

// Send bulk reminders (admin only)
router.post('/send-bulk-reminders', authenticateAdmin, async (req, res) => {
  try {
    const { filter } = req.body;
    
    // Get guests based on filter (e.g., only attending, only VIP, etc.)
    const guests = await GuestList.findAll(filter || {});
    const guestsWithEmail = guests.filter(g => g.email);

    if (guestsWithEmail.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No guests with email addresses found'
      });
    }

    const results = await emailService.sendBulkReminders(guestsWithEmail);

    logger.info(`Bulk reminders sent: ${results.success} success, ${results.failed} failed`);

    res.json({
      success: true,
      message: `Reminders sent to ${results.success} guests`,
      data: results
    });
  } catch (error) {
    logger.error('Send bulk reminders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send bulk reminders'
    });
  }
});

module.exports = router;
