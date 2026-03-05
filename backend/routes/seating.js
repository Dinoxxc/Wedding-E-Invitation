const express = require('express');
const router = express.Router();
const Seating = require('../models/seating');
const authenticateAdmin = require('../middleware/auth');
const { sanitizeInput } = require('../middleware/validation');
const logger = require('../config/logger');

// Get all tables (admin only)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const tables = await Seating.findAll();
    const stats = await Seating.getStats();
    
    res.json({
      success: true,
      data: {
        tables,
        stats
      }
    });
  } catch (error) {
    logger.error('Fetch seating error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch seating arrangement'
    });
  }
});

// Get guests by table (admin only)
router.get('/:tableNumber/guests', authenticateAdmin, async (req, res) => {
  try {
    const guests = await Seating.getGuestsByTable(req.params.tableNumber);
    
    res.json({
      success: true,
      data: guests
    });
  } catch (error) {
    logger.error('Fetch table guests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch table guests'
    });
  }
});

// Add new table (admin only)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const tableData = {
      table_number: req.body.table_number,
      table_name: req.body.table_name ? sanitizeInput(req.body.table_name) : null,
      capacity: parseInt(req.body.capacity) || 10,
      notes: req.body.notes ? sanitizeInput(req.body.notes) : null
    };

    const tableId = await Seating.create(tableData);
    
    logger.info(`Table added: ${tableData.table_number}`);

    res.status(201).json({
      success: true,
      message: 'Table created successfully',
      data: { id: tableId }
    });
  } catch (error) {
    logger.error('Add table error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create table'
    });
  }
});

// Assign guest to table (admin only)
router.post('/assign', authenticateAdmin, async (req, res) => {
  try {
    const { guestId, tableNumber } = req.body;

    if (!guestId || !tableNumber) {
      return res.status(400).json({
        success: false,
        message: 'Guest ID and table number are required'
      });
    }

    const success = await Seating.assignGuestToTable(guestId, tableNumber);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Guest or table not found'
      });
    }

    logger.info(`Guest ${guestId} assigned to table ${tableNumber}`);

    res.json({
      success: true,
      message: 'Guest assigned to table successfully'
    });
  } catch (error) {
    logger.error('Assign guest error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign guest'
    });
  }
});

// Update table (admin only)
router.patch('/:tableNumber', authenticateAdmin, async (req, res) => {
  try {
    const allowedFields = ['table_name', 'capacity', 'notes'];
    const updateData = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = typeof req.body[field] === 'string' 
          ? sanitizeInput(req.body[field]) 
          : req.body[field];
      }
    });

    const success = await Seating.update(req.params.tableNumber, updateData);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }

    logger.info(`Table updated: ${req.params.tableNumber}`);

    res.json({
      success: true,
      message: 'Table updated successfully'
    });
  } catch (error) {
    logger.error('Update table error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update table'
    });
  }
});

// Delete table (admin only)
router.delete('/:tableNumber', authenticateAdmin, async (req, res) => {
  try {
    const success = await Seating.delete(req.params.tableNumber);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }

    logger.info(`Table deleted: ${req.params.tableNumber}`);

    res.json({
      success: true,
      message: 'Table deleted successfully'
    });
  } catch (error) {
    logger.error('Delete table error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete table'
    });
  }
});

module.exports = router;
