import express from 'express';
import cors from 'cors';
import pool from './config/db.js';
import usersRouter, { ensureSuperAdminExists } from './routes/users.js';
import authRouter from './routes/auth.js';
import formRoutes from './routes/forms.js'; 
import dotenv from 'dotenv';
import setupRouter from './routes/setup.js'; 
import settingsRouter from './routes/settings.js';
import path from 'path';

const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));



await ensureSuperAdminExists();


// ✅ Check if superadmin exists (for frontend to know whether to redirect)
app.get('/check-superadmin', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE role = "superadmin" LIMIT 1');
    const exists = rows.length > 0;
    res.json({ exists });
  } catch (err) {
    console.error('Error checking superadmin:', err);
    res.status(500).json({ exists: false });
  }
});
 



if (global.setupMode) {
  app.use('/setup', setupRouter);
} else {
  app.use('/auth', authRouter);
}

app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/forms', formRoutes);
app.use('/api/settings', settingsRouter);


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
