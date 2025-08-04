import express from 'express';
import cors from 'cors';
import usersRouter from './routes/users.js';
import authRouter from './routes/auth.js';
import formRoutes from './routes/forms.js'; 
import { ensureSuperAdminExists } from './routes/users.js';

const app = express();
app.use(cors());
app.use(express.json());

await ensureSuperAdminExists(); 
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/forms', formRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
