import { describe, expect, it, jest } from '@jest/globals';
import { createAccountService } from '../src/services/account.service.js';
import type { DatabaseRepository } from '../src/repositories/database.repository.js';

function createRepositoryMock(overrides: Partial<DatabaseRepository> = {}) {
  return {
    findUserById: jest.fn(),
    listAccounts: jest.fn(),
    findAccountById: jest.fn(),
    createAccount: jest.fn(),
    updateAccountBalance: jest.fn(),
    deleteAccount: jest.fn(),
    createTransaction: jest.fn(),
    listTransactions: jest.fn(),
    findUserByCpf: jest.fn(),
    findUserByEmail: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    createSession: jest.fn(),
    findSessionById: jest.fn(),
    revokeSession: jest.fn(),
    ...overrides,
  } as any as DatabaseRepository;
}

describe('account service transactions', () => {
  it('deposits money and records a transaction', async () => {
    const repository = createRepositoryMock({
      findAccountById: jest.fn().mockResolvedValue({
        id: 'acc-1',
        user_id: 'user-1',
        type: 'corrente',
        agency: '0001',
        account_number: '12345678',
        balance: 100,
        created_at: '2026-05-01T00:00:00.000Z',
        updated_at: '2026-05-01T00:00:00.000Z',
      }) as any,
      updateAccountBalance: jest.fn().mockResolvedValue({
        id: 'acc-1',
        user_id: 'user-1',
        type: 'corrente',
        agency: '0001',
        account_number: '12345678',
        balance: 150,
        created_at: '2026-05-01T00:00:00.000Z',
        updated_at: '2026-05-01T00:00:00.000Z',
      }) as any,
      createTransaction: jest.fn().mockResolvedValue({
        id: 'tx-1',
        account_id: 'acc-1',
        related_account_id: null,
        type: 'deposit',
        amount: 50,
        description: 'Teste',
        balance_before: 100,
        balance_after: 150,
        created_at: '2026-05-01T00:00:00.000Z',
      }) as any,
    });

    const service = createAccountService(repository);
    const result = await service.deposit('user-1', 'acc-1', { amount: 50, description: 'Teste' });

    expect(result.account.balance).toBe(150);
    expect(result.transaction.type).toBe('deposit');
    expect(repository.updateAccountBalance).toHaveBeenCalledWith('acc-1', 150);
    expect(repository.createTransaction).toHaveBeenCalledTimes(1);
  });

  it('rejects withdraw with insufficient balance', async () => {
    const repository = createRepositoryMock({
      findAccountById: jest.fn().mockResolvedValue({
        id: 'acc-1',
        user_id: 'user-1',
        type: 'corrente',
        agency: '0001',
        account_number: '12345678',
        balance: 20,
        created_at: '2026-05-01T00:00:00.000Z',
        updated_at: '2026-05-01T00:00:00.000Z',
      }) as any,
    });

    const service = createAccountService(repository);

    await expect(service.withdraw('user-1', 'acc-1', { amount: 50 })).rejects.toMatchObject({
      message: 'Saldo insuficiente.',
    });
  });

  it('moves money between accounts on transfer', async () => {
    const repository = createRepositoryMock({
      findAccountById: jest.fn((accountId: string) => {
        if (accountId === 'acc-1') {
          return Promise.resolve({
            id: 'acc-1',
            user_id: 'user-1',
            type: 'corrente',
            agency: '0001',
            account_number: '12345678',
            balance: 100,
            created_at: '2026-05-01T00:00:00.000Z',
            updated_at: '2026-05-01T00:00:00.000Z',
          }) as any;
        }

        return Promise.resolve({
          id: 'acc-2',
          user_id: 'user-2',
          type: 'poupança',
          agency: '0001',
          account_number: '87654321',
          balance: 25,
          created_at: '2026-05-01T00:00:00.000Z',
          updated_at: '2026-05-01T00:00:00.000Z',
        }) as any;
      }),
      updateAccountBalance: jest.fn().mockImplementation(async (_id: string, balance: number) => ({
        id: _id,
        user_id: _id === 'acc-1' ? 'user-1' : 'user-2',
        type: _id === 'acc-1' ? 'corrente' : 'poupança',
        agency: '0001',
        account_number: _id === 'acc-1' ? '12345678' : '87654321',
        balance,
        created_at: '2026-05-01T00:00:00.000Z',
        updated_at: '2026-05-01T00:00:00.000Z',
      })) as any,
      createTransaction: jest.fn().mockImplementation(async (input: any) => ({
        id: `${input.type}-tx`,
        account_id: input.accountId,
        related_account_id: input.relatedAccountId,
        type: input.type,
        amount: input.amount,
        description: input.description,
        balance_before: input.balanceBefore,
        balance_after: input.balanceAfter,
        created_at: '2026-05-01T00:00:00.000Z',
      })) as any,
    });

    const service = createAccountService(repository);
    const result = await service.transfer('user-1', 'acc-1', {
      toAccountId: 'acc-2',
      amount: 30,
      description: 'Pagamento',
    });

    expect(result.fromAccount.balance).toBe(70);
    expect(result.toAccount.balance).toBe(55);
    expect(result.transactions).toHaveLength(2);
    expect(repository.updateAccountBalance).toHaveBeenNthCalledWith(1, 'acc-1', 70);
    expect(repository.updateAccountBalance).toHaveBeenNthCalledWith(2, 'acc-2', 55);
  });
});