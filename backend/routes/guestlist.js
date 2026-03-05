const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;
const GuestList = require('../models/guestlist');
const authenticateAdmin = require('../middleware/auth');
const { sanitizeInput } = require('../middleware/validation');
const logger = require('../config/logger');

// Get all guests (admin only)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const filters = {
      invitation_type: req.query.type,
      checked_in: req.query.checked_in,
      search: req.query.search
    };

    const guests = await GuestList.findAll(filters);
    const stats = await GuestList.getStats();
    
    res.json({
      success: true,
      data: {
        guests,
        stats
      }
    });
  } catch (error) {
    logger.error('Fetch guest list error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch guest list'
    });
  }
});

// Get guest by unique code (for public check-in)
router.get('/verify/:code', async (req, res) => {
  try {
    const guest = await GuestList.findByUniqueCode(req.params.code);
    
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found'
      });
    }

    res.json({
      success: true,
      data: guest
    });
  } catch (error) {
    logger.error('Verify guest error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify guest'
    });
  }
});

// Check-in guest
router.post('/checkin/:code', async (req, res) => {
  try {
    const guest = await GuestList.findByUniqueCode(req.params.code);
    
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found'
      });
    }

    if (guest.checked_in) {
      return res.status(400).json({
        success: false,
        message: 'Guest already checked in',
        data: {
          check_in_time: guest.check_in_time
        }
      });
    }

    const success = await GuestList.checkIn(req.params.code);

    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to check in guest'
      });
    }

    logger.info(`Guest checked in: ${guest.name} (${req.params.code})`);

    res.json({
      success: true,
      message: 'Guest checked in successfully',
      data: {
        name: guest.name,
        check_in_time: new Date()
      }
    });
  } catch (error) {
    logger.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check in guest'
    });
  }
});

// Add new guest (admin only)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const uniqueCode = uuidv4();
    const qrCodeUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkin/${uniqueCode}`;
    
    // Generate QR code
    const qrCodePath = path.join(__dirname, '../../uploads/qrcodes', `${uniqueCode}.png`);
    await QRCode.toFile(qrCodePath, qrCodeUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    const guestData = {
      name: sanitizeInput(req.body.name),
      email: req.body.email ? sanitizeInput(req.body.email) : null,
      phone: req.body.phone ? sanitizeInput(req.body.phone) : null,
      invitation_type: req.body.invitation_type || 'Regular',
      max_guests: parseInt(req.body.max_guests) || 1,
      qr_code: `/uploads/qrcodes/${uniqueCode}.png`,
      unique_code: uniqueCode,
      table_number: req.body.table_number || null,
      notes: req.body.notes ? sanitizeInput(req.body.notes) : null
    };

    const guestId = await GuestList.create(guestData);
    
    logger.info(`New guest added: ${guestData.name} (${uniqueCode})`);

    res.status(201).json({
      success: true,
      message: 'Guest added successfully',
      data: {
        id: guestId,
        unique_code: uniqueCode,
        qr_code: guestData.qr_code
      }
    });
  } catch (error) {
    logger.error('Add guest error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add guest'
    });
  }
});

// Bulk import guests (admin only)
router.post('/bulk', authenticateAdmin, async (req, res) => {
  try {
    const { guests } = req.body;

    if (!Array.isArray(guests) || guests.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid guest data'
      });
    }

    const guestsWithQR = await Promise.all(guests.map(async (guest) => {
      const uniqueCode = uuidv4();
      const qrCodeUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkin/${uniqueCode}`;
      
      const qrCodePath = path.join(__dirname, '../../uploads/qrcodes', `${uniqueCode}.png`);
      await QRCode.toFile(qrCodePath, qrCodeUrl, {
        width: 300,
        margin: 2
      });

      return {
        name: sanitizeInput(guest.name),
        email: guest.email ? sanitizeInput(guest.email) : null,
        phone: guest.phone ? sanitizeInput(guest.phone) : null,
        invitation_type: guest.invitation_type || 'Regular',
        max_guests: parseInt(guest.max_guests) || 1,
        qr_code: `/uploads/qrcodes/${uniqueCode}.png`,
        unique_code: uniqueCode,
        table_number: guest.table_number || null,
        notes: guest.notes ? sanitizeInput(guest.notes) : null
      };
    }));

    const count = await GuestList.bulkCreate(guestsWithQR);
    
    logger.info(`Bulk import: ${count} guests added`);

    res.status(201).json({
      success: true,
      message: `${count} guests imported successfully`,
      data: { count }
    });
  } catch (error) {
    logger.error('Bulk import error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import guests'
    });
  }
});

// Update guest (admin only)
router.patch('/:id', authenticateAdmin, async (req, res) => {
  try {
    const allowedFields = ['name', 'email', 'phone', 'invitation_type', 'max_guests', 'table_number', 'notes'];
    const updateData = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = typeof req.body[field] === 'string' 
          ? sanitizeInput(req.body[field]) 
          : req.body[field];
      }
    });

    const success = await GuestList.update(req.params.id, updateData);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found'
      });
    }

    logger.info(`Guest updated: ID ${req.params.id}`);

    res.json({
      success: true,
      message: 'Guest updated successfully'
    });
  } catch (error) {
    logger.error('Update guest error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update guest'
    });
  }
});

// Delete guest (admin only)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const guest = await GuestList.findById(req.params.id);
    
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: 'Guest not found'
      });
    }

    // Delete QR code file
    if (guest.qr_code) {
      const qrPath = path.join(__dirname, '../..', guest.qr_code);
      try {
        await fs.unlink(qrPath);
      } catch (err) {
        logger.warn(`Failed to delete QR code file: ${qrPath}`);
      }
    }

    const success = await GuestList.delete(req.params.id);

    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete guest'
      });
    }

    logger.info(`Guest deleted: ${guest.name} (ID: ${req.params.id})`);

    res.json({
      success: true,
      message: 'Guest deleted successfully'
    });
  } catch (error) {
    logger.error('Delete guest error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete guest'
    });
  }
});

// Download QR code
router.get('/:id/qrcode', authenticateAdmin, async (req, res) => {
  try {
    const guest = await GuestList.findById(req.params.id);
    
    if (!guest || !guest.qr_code) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found'
      });
    }

    const qrPath = path.join(__dirname, '../..', guest.qr_code);
    res.download(qrPath, `${guest.name.replace(/\s+/g, '_')}_QR.png`);
  } catch (error) {
    logger.error('Download QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download QR code'
    });
  }
});

module.exports = router;
