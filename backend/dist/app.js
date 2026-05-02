import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { authRouter } from './routes/auth.routes.js';
import { accountsRouter } from './routes/accounts.routes.js';
import { errorHandler } from './middleware/error-handler.js';
export const app = express();
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: '1mb' }));
app.get('/health', (_req, res) => {
    res.json({ ok: true });
});
app.use('/auth', authRouter);
app.use('/accounts', accountsRouter);
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
app.use(errorHandler);
