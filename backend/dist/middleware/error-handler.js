import { HttpError } from '../utils/errors.js';
export function errorHandler(error, _req, res, _next) {
    if (error instanceof HttpError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
    }
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ error: message });
}
