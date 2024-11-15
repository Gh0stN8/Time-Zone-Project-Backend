app.listen(3000, () => console.log('Server running on http://localhost:3000'));
const express = require('express');
const jwt = require('jsonwebtoken');
const moment = require('../FrontEnd/node_modules/moment/ts3.1-typings/moment');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const secretKey = 'mySecretKey';
const users = [{ username: 'user', password: 'password' }];

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Convert time route
app.post('/convert-time', authenticateToken, (req, res) => {
  const { timezone } = req.body;
  const convertedTime = moment().tz(timezone).format('YYYY-MM-DD HH:mm:ss');
  res.json({ convertedTime });
});







// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Routes
app.get('/api/current-time', authenticateToken, (req, res) => {
    const currentTime = new Date().toLocaleString("en-US", { timeZone: req.user.timeZone });
    res.json({ time: currentTime });
});

// Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Server Setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

