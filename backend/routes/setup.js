import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../config/db.js';

const router = express.Router();
const saltRounds = 10;



router.post('/', async (req, res) => {
  const { fullName, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  await pool.query(
    'INSERT INTO users (fullName, email, password, role, isProtected) VALUES (?, ?, ?, "superadmin", true)',
    [fullName, email, hashedPassword]
  );

  global.setupMode = false; 

  res.json({ message: 'Superadmin created successfully' });
});

export default router;
