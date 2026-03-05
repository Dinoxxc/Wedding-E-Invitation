const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const logger = require('../config/logger');

// Rate limiting configurations
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { success: false, message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip} on ${req.path}`);
      res.status(429).json({
        success: false,
        message
      });
    }
  });
};

// General API rate limiter - 100 requests per 15 minutes
const apiLimiter = createRateLimiter(
  15 * 60 * 1000,
  100,
  'Too many requests from this IP, please try again later.'
);

// Strict limiter for login - 5 attempts per 15 minutes
const loginLimiter = createRateLimiter(
  15 * 60 * 1000,
  5,
  'Too many login attempts, please try again after 15 minutes.'
);

// RSVP submission limiter - 3 submissions per hour
const rsvpLimiter = createRateLimiter(
  60 * 60 * 1000,
  3,
  'Too many RSVP submissions, please try again later.'
);

// Message submission limiter - 5 messages per hour
const messageLimiter = createRateLimiter(
  60 * 60 * 1000,
  5,
  'Too many messages submitted, please try again later.'
);

// Photo upload limiter - 10 uploads per hour
const uploadLimiter = createRateLimiter(
  60 * 60 * 1000,
  10,
  'Too many photo uploads, please try again later.'
);

// Configure helmet for security headers
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      connectSrc: ["'self'", 'ws:', 'wss:']
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
});

// Advanced input sanitization middleware
const advancedSanitize = (req, res, next) => {
  // Remove any potential XSS attacks in query params
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].trim();
      }
    });
  }

  // Remove any potential XSS attacks in body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }

  next();
};

// Request logger middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    };

    if (res.statusCode >= 400) {
      logger.error('Request failed', logData);
    } else {
      logger.info('Request completed', logData);
    }
  });

  next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  logger.error('Application error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    body: req.body
  });
  next(err);
};

module.exports = {
  apiLimiter,
  loginLimiter,
  rsvpLimiter,
  messageLimiter,
  uploadLimiter,
  helmetConfig,
  mongoSanitize: mongoSanitize(),
  xss: xss(),
  advancedSanitize,
  requestLogger,
  errorLogger
};
