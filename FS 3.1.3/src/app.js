// app.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const JWT_SECRET = 'your-secret-key'; // Change this to a secure key in production

// Mock user data
const users = [
  { id: 1, username: 'adminUser', password: 'admin123', role: 'Admin' },
  { id: 2, username: 'modUser', password: 'mod123', role: 'Moderator' },
  { id: 3, username: 'normalUser', password: 'user123', role: 'User' }
];

// ---------------------- LOGIN ROUTE ----------------------
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Create JWT payload with role
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({ token });
});

// ---------------------- AUTH MIDDLEWARE ----------------------
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = decoded; // store user data in request
    next();
  });
}

// ---------------------- ROLE CHECK MIDDLEWARE ----------------------
function checkRole(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: 'Access denied: insufficient role' });
    }
    next();
  };
}

// ---------------------- PROTECTED ROUTES ----------------------

// Admin-only route
app.get('/admin-dashboard', verifyToken, checkRole(['Admin']), (req, res) => {
  res.json({
    message: 'Welcome to the Admin dashboard',
    user: req.user
  });
});

// Moderator-only route
app.get('/moderator-panel', verifyToken, checkRole(['Moderator']), (req, res) => {
  res.json({
    message: 'Welcome to the Moderator panel',
    user: req.user
  });
});

// General user route (any authenticated user)
app.get('/user-profile', verifyToken, (req, res) => {
  res.json({
    message: `Welcome to your profile, ${req.user.username}`,
    user: req.user
  });
});

// ---------------------- SERVER START ----------------------
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

/*
npm install jsonwebtoken


curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"adminUser","password":"admin123"}'



curl -X GET http://localhost:3000/admin-dashboard \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."


curl -X GET http://localhost:3000/moderator-panel \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."


curl -X GET http://localhost:3000/user-profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."


*/