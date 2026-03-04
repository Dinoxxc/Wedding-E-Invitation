const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const RSVP = require('../models/rsvp');
const Message = require('../models/message');
const authenticateAdmin = require('../middleware/auth');

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Simple authentication (using environment variables)
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123';

    if (username !== adminUsername || password !== adminPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { username, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: { token }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// Get all RSVPs (admin only)
router.get('/rsvps', authenticateAdmin, async (req, res) => {
  try {
    const rsvps = await RSVP.findAll();
    const stats = await RSVP.getStats();
    
    res.json({
      success: true,
      data: {
        rsvps,
        stats
      }
    });
  } catch (error) {
    console.error('Fetch RSVPs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch RSVPs'
    });
  }
});

// Get all messages including unapproved (admin only)
router.get('/messages', authenticateAdmin, async (req, res) => {
  try {
    const messages = await Message.findAll(false); // Include unapproved
    
    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Fetch messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
});

// Approve a message (admin only)
router.patch('/messages/:id/approve', authenticateAdmin, async (req, res) => {
  try {
    const success = await Message.approve(req.params.id);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      message: 'Message approved'
    });
  } catch (error) {
    console.error('Approve message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve message'
    });
  }
});

// Delete a message (admin only)
router.delete('/messages/:id', authenticateAdmin, async (req, res) => {
  try {
    const success = await Message.delete(req.params.id);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      message: 'Message deleted'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
});

// Delete an RSVP (admin only)
router.delete('/rsvps/:id', authenticateAdmin, async (req, res) => {
  try {
    const success = await RSVP.delete(req.params.id);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'RSVP not found'
      });
    }

    res.json({
      success: true,
      message: 'RSVP deleted'
    });
  } catch (error) {
    console.error('Delete RSVP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete RSVP'
    });
  }
});

module.exports = router;
