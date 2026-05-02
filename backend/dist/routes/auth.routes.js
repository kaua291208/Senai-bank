import { Router } from 'express';
import { authService } from '../services/service-registry.js';
import { requireAuth } from '../middleware/auth.js';
export const authRouter = Router();
authRouter.post('/register', async (req, res, next) => {
    try {
        const result = await authService.register(req.body);
        res.status(201).json(result);
    }
    catch (error) {
        next(error);
    }
});
authRouter.post('/login', async (req, res, next) => {
    try {
        const result = await authService.login(req.body);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
authRouter.get('/me', requireAuth, async (req, res, next) => {
    try {
        const result = await authService.me(req.auth.sub);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
authRouter.post('/logout', requireAuth, async (req, res, next) => {
    try {
        const result = await authService.logout(req.auth.sid);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
