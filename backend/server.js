require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const rsvpRoutes = require('./routes/rsvp');
const messageRoutes = require('./routes/messages');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/rsvp', rsvpRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);

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
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎊  Wedding E-Invitation Server');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
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
});

module.exports = app;
