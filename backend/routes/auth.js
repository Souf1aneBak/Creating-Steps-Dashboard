import express from 'express';
import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

router.post('/login', async (req, res) => {
    try {
  const { email, password } = req.body;

  const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  if (users.length === 0) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const user = users[0];

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, fullName: user.fullName },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({ token, role: user.role, fullName: user.fullName });
  } catch (err) {
    console.error('Login error:', err); 
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
