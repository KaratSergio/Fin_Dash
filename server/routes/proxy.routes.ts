import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { safeFetch } from '../utils/fetch';
import { env } from '../env/env.dev';

export const proxyRoutes = Router();

proxyRoutes.use(requireAuth); // protect

proxyRoutes.use(async (req, res) => {
    try {
        const token = req.cookies['auth'];
        const body = ['POST', 'PUT', 'PATCH'].includes(req.method) ? JSON.stringify(req.body) : undefined;

        const data = await safeFetch(`${env.apiBase}${req.url}`, {
            method: req.method,
            headers: {
                Authorization: `Basic ${token}`,
                'Fineract-Platform-TenantId': 'default',
                ...(body ? { 'Content-Type': 'application/json' } : {})
            }
        });

        res.json(data);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});
