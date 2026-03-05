const express = require('express');
const router = express.Router();
const Gift = require('../models/gift');
const authenticateAdmin = require('../middleware/auth');
const { sanitizeInput } = require('../middleware/validation');
const logger = require('../config/logger');

// Get all gifts (admin only)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const filters = {
      gift_type: req.query.type,
      search: req.query.search
    };

    const gifts = await Gift.findAll(filters);
    const stats = await Gift.getStats();
    
    res.json({
      success: true,
      data: {
        gifts,
        stats
      }
    });
  } catch (error) {
    logger.error('Fetch gifts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gifts'
    });
  }
});

// Add new gift (admin only)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const giftData = {
      guest_name: sanitizeInput(req.body.guest_name),
      gift_type: req.body.gift_type || 'physical',
      amount: req.body.amount ? parseFloat(req.body.amount) : null,
      description: req.body.description ? sanitizeInput(req.body.description) : null,
      received_date: req.body.received_date || new Date()
    };

    const giftId = await Gift.create(giftData);
    
    logger.info(`Gift added: ${giftData.guest_name} - ${giftData.gift_type}`);

    res.status(201).json({
      success: true,
      message: 'Gift recorded successfully',
      data: { id: giftId }
    });
  } catch (error) {
    logger.error('Add gift error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record gift'
    });
  }
});

// Update gift (admin only)
router.patch('/:id', authenticateAdmin, async (req, res) => {
  try {
    const allowedFields = ['guest_name', 'gift_type', 'amount', 'description', 'received_date'];
    const updateData = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = typeof req.body[field] === 'string' 
          ? sanitizeInput(req.body[field]) 
          : req.body[field];
      }
    });

    const success = await Gift.update(req.params.id, updateData);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Gift not found'
      });
    }

    logger.info(`Gift updated: ID ${req.params.id}`);

    res.json({
      success: true,
      message: 'Gift updated successfully'
    });
  } catch (error) {
    logger.error('Update gift error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update gift'
    });
  }
});

// Delete gift (admin only)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const success = await Gift.delete(req.params.id);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Gift not found'
      });
    }

    logger.info(`Gift deleted: ID ${req.params.id}`);

    res.json({
      success: true,
      message: 'Gift deleted successfully'
    });
  } catch (error) {
    logger.error('Delete gift error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete gift'
    });
  }
});

module.exports = router;
