import { Router } from 'express';
import { login, logout } from '../services/auth.service';

export const authRoutes = Router();

authRoutes.post('/login', login);
authRoutes.post('/logout', logout);
