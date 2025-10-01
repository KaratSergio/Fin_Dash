import { Router } from 'express';
import { safeFetch } from '../utils/fetch';
import { env } from '../env/env.dev';

export const proxyRoutes = Router();

proxyRoutes.use(async (req, res) => {
    try {
        const token = req.session?.fineractToken;
        if (!token) return res.status(401).json({ message: 'Not authenticated' });

        const body = ['POST', 'PUT', 'PATCH'].includes(req.method)
            ? JSON.stringify(req.body)
            : undefined;

        const data = await safeFetch(`${env.apiBase}${req.url}`, {
            method: req.method,
            headers: {
                Authorization: `Basic ${token}`,
                'Fineract-Platform-TenantId': 'default',
                ...(body ? { 'Content-Type': 'application/json' } : {})
            },
            body,
        });

        return res.json(data);

    } catch (err: unknown) {
        if (err instanceof Error) {
            if (err.message.startsWith('Fetch failed: 401')) {
                req.session.destroy(() => { });
                return res.status(401).json({ message: 'Session expired' });
            }
            return res.status(500).json({ message: err.message });
        }

        return res.status(500).json({ message: 'Unknown error' });
    }
});
