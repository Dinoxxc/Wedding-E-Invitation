const express = require('express');
const router = express.Router();
const authenticateAdmin = require('../middleware/auth');
const RSVP = require('../models/rsvp');
const Message = require('../models/message');
const GuestList = require('../models/guestlist');
const Gift = require('../models/gift');
const Photo = require('../models/photo');
const logger = require('../config/logger');

// Get comprehensive analytics (admin only)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const [
      rsvpStats,
      guestListStats,
      giftStats,
      photoCount,
      messageCount
    ] = await Promise.all([
      RSVP.getStats(),
      GuestList.getStats(),
      Gift.getStats(),
      Photo.getCount(),
      Message.getCount()
    ]);

    const analytics = {
      rsvp: {
        total_responses: rsvpStats.total_responses || 0,
        attending: rsvpStats.attending_count || 0,
        not_attending: rsvpStats.not_attending_count || 0,
        total_guests: rsvpStats.total_guests || 0,
        response_rate: guestListStats.total_guests > 0 
          ? ((rsvpStats.total_responses / guestListStats.total_guests) * 100).toFixed(2)
          : 0
      },
      guestList: {
        total_invited: guestListStats.total_guests || 0,
        vip_count: guestListStats.vip_count || 0,
        regular_count: guestListStats.regular_count || 0,
        checked_in: guestListStats.checked_in_count || 0,
        total_capacity: guestListStats.total_capacity || 0,
        check_in_rate: guestListStats.total_guests > 0
          ? ((guestListStats.checked_in_count / guestListStats.total_guests) * 100).toFixed(2)
          : 0
      },
      gifts: {
        total_gifts: giftStats.total_gifts || 0,
        cash_gifts: giftStats.cash_count || 0,
        physical_gifts: giftStats.physical_count || 0,
        total_amount: giftStats.total_amount || 0
      },
      media: {
        photos: photoCount || 0,
        messages: messageCount || 0
      },
      summary: {
        invitation_sent: guestListStats.total_guests || 0,
        rsvp_received: rsvpStats.total_responses || 0,
        guests_attending: rsvpStats.total_guests || 0,
        checked_in: guestListStats.checked_in_count || 0,
        gifts_received: giftStats.total_gifts || 0
      }
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error('Fetch analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
});

// Get RSVP timeline data (admin only)
router.get('/rsvp-timeline', authenticateAdmin, async (req, res) => {
  try {
    const query = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        SUM(CASE WHEN attendance = 'attending' THEN 1 ELSE 0 END) as attending,
        SUM(CASE WHEN attendance = 'not_attending' THEN 1 ELSE 0 END) as not_attending
      FROM rsvp
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;
    
    const db = require('../config/database');
    const [rows] = await db.execute(query);

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    logger.error('Fetch RSVP timeline error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch RSVP timeline'
    });
  }
});

// Get check-in timeline (admin only)
router.get('/checkin-timeline', authenticateAdmin, async (req, res) => {
  try {
    const query = `
      SELECT 
        DATE_FORMAT(check_in_time, '%Y-%m-%d %H:00:00') as hour,
        COUNT(*) as count
      FROM guest_list
      WHERE checked_in = 1 AND check_in_time IS NOT NULL
      GROUP BY hour
      ORDER BY hour ASC
    `;
    
    const db = require('../config/database');
    const [rows] = await db.execute(query);

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    logger.error('Fetch check-in timeline error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch check-in timeline'
    });
  }
});

// Export data as CSV (admin only)
router.get('/export/:type', authenticateAdmin, async (req, res) => {
  try {
    const { type } = req.params;
    let data;
    let filename;

    switch (type) {
      case 'rsvp':
        data = await RSVP.findAll();
        filename = 'rsvp_export.csv';
        break;
      case 'guestlist':
        data = await GuestList.findAll();
        filename = 'guestlist_export.csv';
        break;
      case 'gifts':
        data = await Gift.findAll();
        filename = 'gifts_export.csv';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid export type'
        });
    }

    if (data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No data to export'
      });
    }

    // Convert to CSV
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(val => 
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(',')
    );
    const csv = [headers, ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);

    logger.info(`Data exported: ${type}`);
  } catch (error) {
    logger.error('Export data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export data'
    });
  }
});

module.exports = router;
