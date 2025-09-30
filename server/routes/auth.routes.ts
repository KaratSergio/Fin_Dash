import { Router } from 'express';
import { login, logout } from '../services/auth.service';
// import { requireAuth } from '../middleware/auth.middleware';

export const authRoutes = Router();

authRoutes.post('/login', login);
authRoutes.post('/logout', logout);
// authRoutes.get('/check-auth', requireAuth, checkAuth);
