import express from 'express';
import { loginAccountByToken } from '../db/account.queries';

export const authorizeRole = (allowedRoles: string[]) => {
    return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized Access' });
        }
        
        const user = await loginAccountByToken(token);
        
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized Access' });
        }
        
        if (!allowedRoles.includes(user.role)) {
            return res.status(403).json({ error: 'Access forbidden' });
        }
        
        // Attach the user object to the request for later use
        req.body.user = user;
        next();
    };
};