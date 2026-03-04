const jwt = require('jsonwebtoken');

function authenticateAdmin(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
}

module.exports = authenticateAdmin;
