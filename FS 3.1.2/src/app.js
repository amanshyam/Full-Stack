const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

// Hardcoded user (for demo)
const user = {
  id: 1,
  username: "testuser",
  password: "password123",
};

// Secret key for JWT signing
const SECRET_KEY = "your_secret_key_here";

// --- LOGIN ROUTE ---
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Simple authentication
  if (username === user.username && password === user.password) {
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    return res.status(200).json({ token });
  }

  res.status(401).json({ message: "Invalid credentials" });
});

// --- MIDDLEWARE TO VERIFY TOKEN ---
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "Token missing" });
  }

  const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = decoded;
    next();
  });
}

// --- PROTECTED ROUTE ---
app.get("/protected", verifyToken, (req, res) => {
  res.json({
    message: "You have accessed a protected route!",
    user: req.user,
  });
});

// --- SERVER START ---
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

/*
npm install jsonwebtoken


curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'
*/