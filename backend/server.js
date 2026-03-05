require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const compression = require('compression');
const morgan = require('morgan');

// Import routes
const rsvpRoutes = require('./routes/rsvp');
const messageRoutes = require('./routes/messages');
const adminRoutes = require('./routes/admin');
const guestListRoutes = require('./routes/guestlist');
const photoRoutes = require('./routes/photos');
const giftRoutes = require('./routes/gifts');
const seatingRoutes = require('./routes/seating');
const analyticsRoutes = require('./routes/analytics');
const notificationRoutes = require('./routes/notifications');

// Import middleware
const logger = require('./config/logger');
const security = require('./middleware/security');
const db = require('./config/database');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

// Security middleware
app.use(security.helmetConfig);
app.use(security.requestLogger);
app.use(compression());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Body parser with size limits
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization
app.use(security.mongoSanitize);
app.use(security.xss);
app.use(security.advancedSanitize);

// HTTP request logger
app.use(morgan('combined', { stream: logger.stream }));

// Serve static files from frontend and uploads directory
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Make io accessible to routes
app.set('io', io);

// API Routes with rate limiting
app.use('/api/rsvp', security.rsvpLimiter, rsvpRoutes);
app.use('/api/messages', security.messageLimiter, messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/guestlist', guestListRoutes);
// Apply upload limiter only to specific photo routes (not admin routes)
app.use('/api/photos', photoRoutes);
app.use('/api/gifts', giftRoutes);
app.use('/api/seating', seatingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/story', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/story.html'));
});

app.get('/gallery', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/gallery.html'));
});

app.get('/details', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/details.html'));
});

app.get('/rsvp', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/rsvp.html'));
});

app.get('/messages', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/messages.html'));
});

app.get('/registry', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/registry.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/admin.html'));
});

// 404 handler
app.use((req, res) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Error handler
app.use(security.errorLogger);
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ 
    success: false, 
    message: err.message || 'Internal server error' 
  });
});

// WebSocket for live comments
io.on('connection', (socket) => {
  logger.info(`New client connected: ${socket.id}`);
  
  socket.on('new-comment', (data) => {
    logger.info('New comment received', { data });
    io.emit('comment-added', data);
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Test database connection and start server
console.log('Testing database connection...');
db.getConnection()
  .then(connection => {
    console.log('✓ Database connected successfully');
    connection.release();
    
    // Start server after database is ready
    console.log(`Starting server on port ${PORT}...`);
    server.listen(PORT, () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🎊  Wedding E-Invitation Server v2.0');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ WebSocket enabled for live comments`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Available routes:');
      console.log(`  → Home:     http://localhost:${PORT}/`);
      console.log(`  → Story:    http://localhost:${PORT}/story`);
      console.log(`  → Gallery:  http://localhost:${PORT}/gallery`);
      console.log(`  → Details:  http://localhost:${PORT}/details`);
      console.log(`  → RSVP:     http://localhost:${PORT}/rsvp`);
      console.log(`  → Messages: http://localhost:${PORT}/messages`);
      console.log(`  → Registry: http://localhost:${PORT}/registry`);
      console.log(`  → Admin:    http://localhost:${PORT}/admin`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      logger.info('Server started successfully');
    }).on('error', (err) => {
      logger.error('Server failed to start', { error: err.message });
      console.error('✗ Server failed to start:', err.message);
      process.exit(1);
    });
  })
  .catch(err => {
    console.error('✗ Database connection failed:', err.message);
    logger.error('✗ Database connection failed', { error: err.message });
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection', { error: err });
  console.error('Unhandled Promise Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { error: err });
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

module.exports = { app, server, io };
