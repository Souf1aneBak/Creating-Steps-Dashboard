import express from 'express';
import pool from '../config/db.js';
import bcrypt from 'bcrypt';

const router = express.Router();
const saltRounds = 10;
const hash = await bcrypt.hash('admin123', 10);
console.log(hash);

router.get('/', async (req, res) => {
  const [users] = await pool.query('SELECT id, fullName, email, role FROM users');
  res.json(users);
});


router.post('/', async (req, res) => {
  const { fullName, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  await pool.query(
    'INSERT INTO users (fullName, email, password, role) VALUES (?, ?, ?, ?)',
    [fullName, email, hashedPassword, role]
  );
  res.json({ message: 'User created' });
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { fullName, email, password, role } = req.body;

  const [[user]] = await pool.query('SELECT isProtected FROM users WHERE id=?', [id]);

  let hashedPassword = password;
  if (password) {
    hashedPassword = await bcrypt.hash(password, saltRounds);
  }

  if (user?.isProtected) {
    
    await pool.query(
      'UPDATE users SET email=?, password=? WHERE id=?',
      [email, hashedPassword, id]
    );
  } else {
    await pool.query(
      'UPDATE users SET fullName=?, email=?, password=?, role=? WHERE id=?',
      [fullName, email, hashedPassword, role, id]
    );
  }

  res.json({ message: 'User updated' });
});


router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  
  const [[user]] = await pool.query('SELECT isProtected FROM users WHERE id=?', [id]);

  if (user?.isProtected) {
    return res.status(403).json({ message: 'Cannot delete superadmin' });
  }

  await pool.query('DELETE FROM users WHERE id=?', [id]);
  res.json({ message: 'User deleted' });
});


export default router;
