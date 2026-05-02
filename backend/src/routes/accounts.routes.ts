import { Router } from 'express';
import { accountService, authService } from '../services/service-registry.js';
import { requireAuth } from '../middleware/auth.js';

export const accountsRouter = Router();

accountsRouter.use(requireAuth);

accountsRouter.get('/', async (req, res, next) => {
  try {
    const result = await accountService.listAccounts(req.auth!.sub as string);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

accountsRouter.post('/', async (req, res, next) => {
  try {
    const result = await accountService.createAccount(req.auth!.sub as string, req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

accountsRouter.put('/me', async (req, res, next) => {
  try {
    const result = await authService.updateUser(req.auth!.sub as string, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

accountsRouter.delete('/:id', async (req, res, next) => {
  try {
    const result = await accountService.deleteAccount(req.auth!.sub as string, req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

accountsRouter.get('/:id/balance', async (req, res, next) => {
  try {
    const result = await accountService.getBalance(req.auth!.sub as string, req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

accountsRouter.get('/:id/statement', async (req, res, next) => {
  try {
    const result = await accountService.getStatement(req.auth!.sub as string, req.params.id, {
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
      startDate: typeof req.query.startDate === 'string' ? req.query.startDate : undefined,
      endDate: typeof req.query.endDate === 'string' ? req.query.endDate : undefined,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

accountsRouter.post('/:id/deposit', async (req, res, next) => {
  try {
    const result = await accountService.deposit(req.auth!.sub as string, req.params.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

accountsRouter.post('/:id/withdraw', async (req, res, next) => {
  try {
    const result = await accountService.withdraw(req.auth!.sub as string, req.params.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

accountsRouter.post('/:id/transfer', async (req, res, next) => {
  try {
    const result = await accountService.transfer(req.auth!.sub as string, req.params.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});