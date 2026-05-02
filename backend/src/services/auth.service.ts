import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { DatabaseRepository } from '../repositories/database.repository.js';
import type { UserRow } from '../types.js';
import {
  isStrongPassword,
  isValidCpf,
  isValidEmail,
  isValidName,
  normalizeCpf,
  normalizeEmail,
} from '../utils/validation.js';
import { HttpError } from '../utils/errors.js';

interface RegisterInput {
  name: string;
  cpf: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

function toPublicUser(user: UserRow) {
  const { password_hash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

function parseExpiresIn(value: string) {
  const match = value.trim().match(/^(\d+)([smhd])$/i);
  if (!match) {
    return 8 * 60 * 60 * 1000;
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const unitMap: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * unitMap[unit];
}

function buildSessionExpiry(expiresIn: string) {
  return new Date(Date.now() + parseExpiresIn(expiresIn)).toISOString();
}

export function createAuthService(repository: DatabaseRepository) {
  return {
    async register(input: RegisterInput) {
      const name = input.name.trim();
      const cpf = normalizeCpf(input.cpf);
      const email = normalizeEmail(input.email);
      const password = input.password;

      if (!isValidName(name)) {
        throw new HttpError(400, 'Nome inválido.');
      }

      if (!isValidCpf(cpf)) {
        throw new HttpError(400, 'CPF inválido.');
      }

      if (!isValidEmail(email)) {
        throw new HttpError(400, 'E-mail inválido.');
      }

      if (!isStrongPassword(password)) {
        throw new HttpError(400, 'Senha fraca. Use ao menos 8 caracteres com letras e números.');
      }

      const [cpfExists, emailExists] = await Promise.all([
        repository.findUserByCpf(cpf),
        repository.findUserByEmail(email),
      ]);

      if (cpfExists) {
        throw new HttpError(409, 'CPF já cadastrado.');
      }

      if (emailExists) {
        throw new HttpError(409, 'E-mail já cadastrado.');
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await repository.createUser({ name, cpf, email, passwordHash });
      return { user: toPublicUser(user) };
    },

    async login(input: LoginInput) {
      const email = normalizeEmail(input.email);
      const password = input.password;

      if (!isValidEmail(email)) {
        throw new HttpError(400, 'E-mail inválido.');
      }

      if (!password) {
        throw new HttpError(400, 'Senha obrigatória.');
      }

      const user = await repository.findUserByEmail(email);
      if (!user) {
        throw new HttpError(401, 'Credenciais inválidas.');
      }

      const passwordMatches = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatches) {
        throw new HttpError(401, 'Credenciais inválidas.');
      }

      const session = await repository.createSession({
        userId: user.id,
        expiresAt: buildSessionExpiry(env.jwtExpiresIn),
      });

      const token = jwt.sign(
        { sid: session.id, sub: user.id, email: user.email },
        env.jwtSecret,
        { expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'] }
      );

      return {
        token,
        user: toPublicUser(user),
      };
    },

    async me(userId: string) {
      const user = await repository.findUserById(userId);
      if (!user) {
        throw new HttpError(404, 'Usuário não encontrado.');
      }

      return { user: toPublicUser(user) };
    },

    async logout(sessionId: string) {
      await repository.revokeSession(sessionId);
      return { ok: true };
    },

    async updateUser(userId: string, input: { name?: string; email?: string }) {
      const updates: { name?: string; email?: string } = {};

      if (input.name !== undefined) {
        const name = input.name.trim();
        if (!isValidName(name)) {
          throw new HttpError(400, 'Nome inválido.');
        }
        updates.name = name;
      }

      if (input.email !== undefined) {
        const email = normalizeEmail(input.email);
        if (!isValidEmail(email)) {
          throw new HttpError(400, 'E-mail inválido.');
        }
        updates.email = email;
      }

      if (Object.keys(updates).length === 0) {
        throw new HttpError(400, 'Nenhum dado informado para atualização.');
      }

      const user = await repository.updateUser(userId, updates);
      return { user: toPublicUser(user) };
    },
  };
}