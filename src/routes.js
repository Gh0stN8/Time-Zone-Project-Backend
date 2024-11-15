const express = require('express');
const jwt = require('jsonwebtoken');
const moment = require('moment-timezone');

const router = express.Router();

// Secret key for JWT (in a real app, use an environment variable)
const JWT_SECRET = 'your_jwt_secret_key';

// Hardcoded user for demo (replace with database in real application)
const USER = {
  username: 'user1',
  password: 'password123', // You would never hardcode passwords in production
};

// Middleware to verify JWT
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token.' });
    req.user = user;
    next();
  });
}

// Route: POST /login - User login, returns JWT token if credentials are correct
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Validate username and password
  if (username === USER.username && password === USER.password) {
    // Generate a JWT token
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token });
  }

  // If credentials are incorrect
  res.status(401).json({ message: 'Invalid username or password.' });
});

// Route: POST /convert-time - Convert time to a specified timezone, protected by JWT
router.post('/convert-time', authenticateToken, (req, res) => {
  const { time, targetTimeZone } = req.body;

  // Validate the inputs
  if (!time || !targetTimeZone) {
    return res.status(400).json({ message: 'Time and targetTimeZone are required.' });
  }

  // Convert time to the specified timezone
  try {
    const convertedTime = moment.tz(time, targetTimeZone).format('YYYY-MM-DD HH:mm:ss');
    res.json({ convertedTime });
  } catch (error) {
    res.status(400).json({ message: 'Invalid timezone or time format.' });
  }
});

module.exports = router;
