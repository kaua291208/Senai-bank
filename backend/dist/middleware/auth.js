import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { databaseRepository } from '../services/service-registry.js';
import { HttpError } from '../utils/errors.js';
export async function requireAuth(req, _res, next) {
    try {
        const authorization = req.headers.authorization;
        if (!authorization?.startsWith('Bearer ')) {
            throw new HttpError(401, 'Token não informado.');
        }
        const token = authorization.slice(7);
        const payload = jwt.verify(token, env.jwtSecret);
        const userId = payload.sub;
        const sessionId = payload.sid;
        if (typeof userId !== 'string' || typeof sessionId !== 'string') {
            throw new HttpError(401, 'Token inválido.');
        }
        const session = await databaseRepository.findSessionById(sessionId);
        if (!session || session.revoked) {
            throw new HttpError(401, 'Sessão inválida.');
        }
        if (new Date(session.expires_at).getTime() < Date.now()) {
            throw new HttpError(401, 'Sessão expirada.');
        }
        req.auth = { ...payload, sub: userId, sid: sessionId, email: payload.email };
        next();
    }
    catch (error) {
        next(error instanceof HttpError ? error : new HttpError(401, 'Não autorizado.'));
    }
}
