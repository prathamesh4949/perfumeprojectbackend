const jwt = require('jsonwebtoken');

// Use environment variable for JWT_SECRET with a fallback
const JWT_SECRET = process.env.JWT_SECRET || 'd32a1bcae14e7c97704899ac2e5cd1811e45ad2e028a8748a2b90178ac0cd6e7a72b0bab1f71530ccc462479b886e09405f3415bac15549dc538e9c81728c814';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided or invalid format.' });
  }

  const token = authHeader.split(' ')[1]; // Extract token after "Bearer"

  if (!token) {
    return res.status(401).json({ message: 'Access denied. Token missing.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded JWT:', decoded); // Debug log
    req.user = {
      id: decoded.id || decoded._id, // Handle different JWT payload structures
      email: decoded.email, // Include email if present in token
    };
    if (!req.user.id) {
      return res.status(403).json({ message: 'Invalid token: User ID not found.' });
    }
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Token has expired. Please log in again.' });
    }
    return res.status(403).json({ message: 'Invalid token.' });
  }
};

module.exports = verifyToken;