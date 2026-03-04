const express = require('express');
const router = express.Router();
const Message = require('../models/message');
const { validateMessage, sanitizeInput } = require('../middleware/validation');

// Submit a new message
router.post('/', validateMessage, async (req, res) => {
  try {
    const sanitizedData = {
      guest_name: sanitizeInput(req.body.guest_name),
      message: sanitizeInput(req.body.message),
      approved: true // Auto-approve by default, can be changed in admin panel
    };

    const messageId = await Message.create(sanitizedData);
    
    res.status(201).json({
      success: true,
      message: 'Message submitted successfully!',
      data: { id: messageId }
    });
  } catch (error) {
    console.error('Message submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit message. Please try again later.'
    });
  }
});

// Get all approved messages (public route)
router.get('/', async (req, res) => {
  try {
    const messages = await Message.findAll(true); // Only approved messages
    
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

// Get message count
router.get('/count', async (req, res) => {
  try {
    const count = await Message.getCount();
    
    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Message count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get message count'
    });
  }
});

module.exports = router;
