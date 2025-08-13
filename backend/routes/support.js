import express from 'express';
import pool from '../config/db.js';
import transporter from '../utils/mailer.js'; // Import transporter directly

const router = express.Router();

router.post('/api/support/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email address' });
  }

  try {
    
    await pool.query(
      'INSERT INTO support_messages (name, email, message) VALUES (?, ?, ?)',
      [name, email, message]
    );

    
    await transporter.sendMail({
      from: `"Support Form" <${process.env.EMAIL_USER}>`, 
      to: 'mariemektiri3@gmail.com',                      
      subject: `New Support Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    res.status(200).json({ message: 'Support message received and email sent' });
  } catch (error) {
    console.error('Error processing support message:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
