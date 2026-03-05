const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Photo = require('../models/photo');
const authenticateAdmin = require('../middleware/auth');
const { sanitizeInput } = require('../middleware/validation');
const logger = require('../config/logger');
const { uploadLimiter } = require('../middleware/security');

// Configure multer for photo upload
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/photos');
    try {
      await fs.access(uploadPath);
    } catch {
      await fs.mkdir(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'photo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WEBP)'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Get all photos (public - only approved)
router.get('/', async (req, res) => {
  try {
    const photos = await Photo.findAll(true);
    
    res.json({
      success: true,
      data: photos
    });
  } catch (error) {
    logger.error('Fetch photos error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch photos'
    });
  }
});

// Get all photos including unapproved (admin only)
router.get('/admin/all', authenticateAdmin, async (req, res) => {
  try {
    const photos = await Photo.findAll(false);
    
    res.json({
      success: true,
      data: photos
    });
  } catch (error) {
    logger.error('Fetch all photos error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch photos'
    });
  }
});

// Upload photo
router.post('/upload', uploadLimiter, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const photoData = {
      filename: req.file.filename,
      path: `/uploads/photos/${req.file.filename}`,
      uploaded_by: req.body.uploaded_by ? sanitizeInput(req.body.uploaded_by) : 'Anonymous',
      caption: req.body.caption ? sanitizeInput(req.body.caption) : null,
      approved: process.env.AUTO_APPROVE_PHOTOS === 'true' ? true : false
    };

    const photoId = await Photo.create(photoData);

    // Emit socket event for real-time update
    if (req.app.get('io')) {
      req.app.get('io').emit('new-photo', {
        id: photoId,
        ...photoData
      });
    }

    logger.info(`Photo uploaded: ${req.file.filename} by ${photoData.uploaded_by}`);

    res.status(201).json({
      success: true,
      message: photoData.approved 
        ? 'Photo uploaded successfully' 
        : 'Photo uploaded and pending approval',
      data: {
        id: photoId,
        path: photoData.path
      }
    });
  } catch (error) {
    logger.error('Photo upload error:', error);
    
    // Delete file if database insert failed
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        logger.error('Failed to delete uploaded file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload photo'
    });
  }
});

// Upload multiple photos
router.post('/upload-multiple', uploadLimiter, upload.array('photos', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploaded = [];
    const failed = [];

    for (const file of req.files) {
      try {
        const photoData = {
          filename: file.filename,
          path: `/uploads/photos/${file.filename}`,
          uploaded_by: req.body.uploaded_by ? sanitizeInput(req.body.uploaded_by) : 'Anonymous',
          caption: null,
          approved: process.env.AUTO_APPROVE_PHOTOS === 'true' ? true : false
        };

        const photoId = await Photo.create(photoData);
        uploaded.push({ id: photoId, filename: file.filename });

        // Emit socket event
        if (req.app.get('io')) {
          req.app.get('io').emit('new-photo', {
            id: photoId,
            ...photoData
          });
        }
      } catch (error) {
        failed.push({ filename: file.filename, error: error.message });
        // Delete failed file
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          logger.error('Failed to delete file:', unlinkError);
        }
      }
    }

    logger.info(`Bulk upload: ${uploaded.length} success, ${failed.length} failed`);

    res.status(201).json({
      success: true,
      message: `${uploaded.length} photos uploaded successfully`,
      data: {
        uploaded,
        failed
      }
    });
  } catch (error) {
    logger.error('Bulk photo upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload photos'
    });
  }
});

// Approve photo (admin only)
router.patch('/:id/approve', authenticateAdmin, async (req, res) => {
  try {
    const success = await Photo.approve(req.params.id);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }

    logger.info(`Photo approved: ID ${req.params.id}`);

    res.json({
      success: true,
      message: 'Photo approved'
    });
  } catch (error) {
    logger.error('Approve photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve photo'
    });
  }
});

// Update photo caption (admin only)
router.patch('/:id/caption', authenticateAdmin, async (req, res) => {
  try {
    const { caption } = req.body;
    
    if (!caption) {
      return res.status(400).json({
        success: false,
        message: 'Caption is required'
      });
    }

    const success = await Photo.updateCaption(req.params.id, sanitizeInput(caption));
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }

    logger.info(`Photo caption updated: ID ${req.params.id}`);

    res.json({
      success: true,
      message: 'Caption updated'
    });
  } catch (error) {
    logger.error('Update caption error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update caption'
    });
  }
});

// Delete photo (admin only)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }

    // Delete file from disk
    const filePath = path.join(__dirname, '../..', photo.path);
    try {
      await fs.unlink(filePath);
    } catch (err) {
      logger.warn(`Failed to delete photo file: ${filePath}`, err);
    }

    const success = await Photo.delete(req.params.id);

    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete photo from database'
      });
    }

    logger.info(`Photo deleted: ${photo.filename} (ID: ${req.params.id})`);

    res.json({
      success: true,
      message: 'Photo deleted'
    });
  } catch (error) {
    logger.error('Delete photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete photo'
    });
  }
});

module.exports = router;
