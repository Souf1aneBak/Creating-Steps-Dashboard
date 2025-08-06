import express from 'express';
import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendOtpEmail } from '../utils/mailer.js';

const router = express.Router();
const otps = new Map();
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

    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otps.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 }); 
    
    await sendOtpEmail(email, otp);

    res.status(200).json({
  status: 'otp_required',
  message: 'OTP sent to email',
  email, 
});

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = otps.get(email);
    if (!record || record.otp !== otp || Date.now() > record.expiresAt) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];

    const token = jwt.sign(
      { id: user.id, role: user.role, fullName: user.fullName },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    otps.delete(email); 

    res.json({ token, role: user.role, fullName: user.fullName });
  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


export default router;
