import express from 'express';
import multer from 'multer';
import path from 'path';
import pool from '../config/db.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `logo_${Date.now()}${ext}`;
    console.log('Saving file as:', filename);
    cb(null, filename);
  }
});
const upload = multer({ storage });

// GET route unchanged
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM settings LIMIT 1');
    if (rows.length === 0) {
      return res.json({
        siteName: 'EZZA',
        footerText: '© 2025 Tous droits réservés.',
        contactEmail: '',
        phone: '',
        address: '',
        socialLinks: { facebook: '', instagram: '', twitter: '', linkedin: '' }
      });
    }
    const data = rows[0];
    res.json({
      siteName: data.siteName,
      footerText: data.footerText,
      contactEmail: data.contactEmail,
      phone: data.phone,
      address: data.address,
      logoUrl: data.logoUrl,
      socialLinks: {
        facebook: data.facebook,
        instagram: data.instagram,
        twitter: data.twitter,
        linkedin: data.linkedin
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching settings' });
  }
});

// POST route with upload.fields and logging
router.post('/', upload.fields([{ name: 'logo', maxCount: 1 }]), async (req, res) => {
  try {
    console.log('req.body:', req.body);
    console.log('req.files:', req.files);

    const [rows] = await pool.query('SELECT * FROM settings LIMIT 1');
    const existing = rows.length ? rows[0] : null;

    const getValidValue = (newVal, oldVal) => (newVal !== undefined && newVal !== '' ? newVal : oldVal);

const siteName = getValidValue(req.body.siteName, existing ? existing.siteName : '');
const footerText = getValidValue(req.body.footerText, existing ? existing.footerText : '');
const contactEmail = getValidValue(req.body.contactEmail, existing ? existing.contactEmail : '');
const phone = getValidValue(req.body.phone, existing ? existing.phone : '');
const address = getValidValue(req.body.address, existing ? existing.address : '');
const facebook = getValidValue(req.body.facebook, existing ? existing.facebook : '');
const instagram = getValidValue(req.body.instagram, existing ? existing.instagram : '');
const twitter = getValidValue(req.body.twitter, existing ? existing.twitter : '');
const linkedin = getValidValue(req.body.linkedin, existing ? existing.linkedin : '');


    let logoUrl = existing ? existing.logoUrl : null;
    if (req.files && req.files.logo && req.files.logo.length > 0) {
      logoUrl = `/uploads/${req.files.logo[0].filename}`;
      console.log('New logo URL:', logoUrl);
    }

    if (existing) {
      // Update the existing settings row
      await pool.query(`
        UPDATE settings SET
          siteName = ?,
          footerText = ?,
          contactEmail = ?,
          phone = ?,
          address = ?,
          logoUrl = ?,
          facebook = ?,
          instagram = ?,
          twitter = ?,
          linkedin = ?
        WHERE id = ?
      `, [siteName, footerText, contactEmail, phone, address, logoUrl, facebook, instagram, twitter, linkedin, existing.id]);
    } else {
      // Insert new row if none exists
      await pool.query(`
        INSERT INTO settings
          (siteName, footerText, contactEmail, phone, address, logoUrl, facebook, instagram, twitter, linkedin)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [siteName, footerText, contactEmail, phone, address, logoUrl, facebook, instagram, twitter, linkedin]);
    }

    const [updatedRows] = await pool.query('SELECT * FROM settings LIMIT 1');
    res.json(updatedRows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error saving settings' });
  }
});

export default router;
