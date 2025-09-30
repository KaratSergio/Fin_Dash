import { Request, Response, NextFunction } from 'express';

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
    if (!req.cookies['auth']) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
    }
    next();
}