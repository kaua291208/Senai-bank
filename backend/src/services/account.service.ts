import type { DatabaseRepository } from '../repositories/database.repository.js';
import type { AccountRow, TransactionRow } from '../types.js';
import {
  formatBRL,
  isValidAccountType,
  isValidAmount,
  isValidDescription,
  isValidEmail,
  isValidName,
  parseAmount,
} from '../utils/validation.js';
import { HttpError } from '../utils/errors.js';
import { toMoney, toMoneyString } from '../utils/formatters.js';
import type { AccountType } from '../types.js';

interface MonetaryInput {
  amount: number | string;
  description?: string;
}

interface TransferInput extends MonetaryInput {
  toAccountNumber: string;
}

function accountTypeLabel(type: string) {
  return type === 'poupança' ? 'Poupança' : 'Corrente';
}

function transactionLabel(type: TransactionRow['type']) {
  switch (type) {
    case 'deposit':
      return 'Depósito';
    case 'withdraw':
      return 'Saque';
    case 'transfer_in':
      return 'Transferência recebida';
    case 'transfer_out':
      return 'Transferência enviada';
    default:
      return 'Transação';
  }
}

function normalizeOptionalDescription(description?: string) {
  if (description == null) {
    return null;
  }

  const normalized = description.trim();
  if (!normalized) {
    return null;
  }

  if (!isValidDescription(normalized)) {
    throw new HttpError(400, 'Descrição contém caracteres inválidos.');
  }

  return normalized;
}

function ensureValidAmount(amountInput: number | string) {
  const amount = parseAmount(amountInput);
  if (!isValidAmount(amount)) {
    throw new HttpError(400, 'Valor inválido.');
  }
  return toMoney(amount);
}

function ensureAccountOwnership(account: AccountRow | null, userId: string) {
  if (!account) {
    throw new HttpError(404, 'Conta não encontrada.');
  }

  if (account.user_id !== userId) {
    throw new HttpError(403, 'Conta não pertence ao usuário autenticado.');
  }

  return account;
}

function toAccountResponse(account: AccountRow, owner: string) {
  return {
    id: account.id,
    accountNumber: account.account_number,
    agency: account.agency,
    type: account.type,
    balance: Number(account.balance),
    balanceFormatted: formatBRL(Number(account.balance)),
    owner,
    createdAt: account.created_at,
  };
}

function toBalanceResponse(account: AccountRow) {
  return {
    accountId: account.id,
    accountNumber: account.account_number,
    agency: account.agency,
    type: account.type,
    balance: Number(account.balance),
    balanceFormatted: formatBRL(Number(account.balance)),
    updatedAt: account.updated_at,
  };
}

function toTransactionResponse(transaction: TransactionRow) {
  return {
    id: transaction.id,
    type: transaction.type,
    typeLabel: transactionLabel(transaction.type),
    amount: Number(transaction.amount),
    amountFormatted: toMoneyString(Number(transaction.amount)),
    description: transaction.description || '',
    balanceBefore: Number(transaction.balance_before),
    balanceAfter: Number(transaction.balance_after),
    createdAt: transaction.created_at,
  };
}

export function createAccountService(repository: DatabaseRepository) {
  return {
    async listAccounts(userId: string) {
      const user = await repository.findUserById(userId);
      if (!user) {
        throw new HttpError(404, 'Usuário não encontrado.');
      }

      const accounts = await repository.listAccounts(userId);
      return {
        accounts: accounts.map((account) => toAccountResponse(account, user.name)),
      };
    },

    async createAccount(userId: string, input: { type: AccountType }) {
      if (!isValidAccountType(input.type)) {
        throw new HttpError(400, 'Tipo de conta inválido.');
      }

      const account = await repository.createAccount({ userId, type: input.type });
      return { account: toAccountResponse(account, '') };
    },

    async deleteAccount(userId: string, accountId: string) {
      const account = ensureAccountOwnership(await repository.findAccountById(accountId), userId);
      if (Number(account.balance) !== 0) {
        throw new HttpError(400, 'A conta só pode ser encerrada com saldo zerado.');
      }

      await repository.deleteAccount(accountId);
      return { ok: true };
    },

    async getBalance(userId: string, accountId: string) {
      const account = ensureAccountOwnership(await repository.findAccountById(accountId), userId);
      return toBalanceResponse(account);
    },

    async deposit(userId: string, accountId: string, input: MonetaryInput) {
      const account = ensureAccountOwnership(await repository.findAccountById(accountId), userId);
      const amount = ensureValidAmount(input.amount);
      const description = normalizeOptionalDescription(input.description);
      const balanceBefore = Number(account.balance);
      const balanceAfter = toMoney(balanceBefore + amount);

      const updatedAccount = await repository.updateAccountBalance(account.id, balanceAfter);
      const transaction = await repository.createTransaction({
        accountId: account.id,
        relatedAccountId: null,
        type: 'deposit',
        amount,
        description,
        balanceBefore,
        balanceAfter,
      });

      return {
        account: toBalanceResponse(updatedAccount),
        transaction: toTransactionResponse(transaction),
      };
    },

    async withdraw(userId: string, accountId: string, input: MonetaryInput) {
      const account = ensureAccountOwnership(await repository.findAccountById(accountId), userId);
      const amount = ensureValidAmount(input.amount);
      const description = normalizeOptionalDescription(input.description);
      const balanceBefore = Number(account.balance);

      if (balanceBefore < amount) {
        throw new HttpError(400, 'Saldo insuficiente.');
      }

      const balanceAfter = toMoney(balanceBefore - amount);
      const updatedAccount = await repository.updateAccountBalance(account.id, balanceAfter);
      const transaction = await repository.createTransaction({
        accountId: account.id,
        relatedAccountId: null,
        type: 'withdraw',
        amount,
        description,
        balanceBefore,
        balanceAfter,
      });

      return {
        account: toBalanceResponse(updatedAccount),
        transaction: toTransactionResponse(transaction),
      };
    },

    async transfer(userId: string, accountId: string, input: TransferInput) {
      const fromAccount = ensureAccountOwnership(await repository.findAccountById(accountId), userId);
      const toAccount = await repository.findAccountByAccountNumber(input.toAccountNumber);

      if (!toAccount) {
        throw new HttpError(404, 'Conta de destino não encontrada.');
      }

      if (fromAccount.id === toAccount.id) {
        throw new HttpError(400, 'A conta de destino deve ser diferente da conta de origem.');
      }

      const amount = ensureValidAmount(input.amount);
      const description = normalizeOptionalDescription(input.description);
      const fromBalanceBefore = Number(fromAccount.balance);
      const toBalanceBefore = Number(toAccount.balance);

      if (fromBalanceBefore < amount) {
        throw new HttpError(400, 'Saldo insuficiente.');
      }

      const fromBalanceAfter = toMoney(fromBalanceBefore - amount);
      const toBalanceAfter = toMoney(toBalanceBefore + amount);

      const updatedFromAccount = await repository.updateAccountBalance(fromAccount.id, fromBalanceAfter);
      const updatedToAccount = await repository.updateAccountBalance(toAccount.id, toBalanceAfter);

      const outboundTransaction = await repository.createTransaction({
        accountId: fromAccount.id,
        relatedAccountId: toAccount.id,
        type: 'transfer_out',
        amount,
        description,
        balanceBefore: fromBalanceBefore,
        balanceAfter: fromBalanceAfter,
      });

      const inboundTransaction = await repository.createTransaction({
        accountId: toAccount.id,
        relatedAccountId: fromAccount.id,
        type: 'transfer_in',
        amount,
        description,
        balanceBefore: toBalanceBefore,
        balanceAfter: toBalanceAfter,
      });

      return {
        fromAccount: toBalanceResponse(updatedFromAccount),
        toAccount: toBalanceResponse(updatedToAccount),
        transactions: [toTransactionResponse(outboundTransaction), toTransactionResponse(inboundTransaction)],
      };
    },

    async getStatement(userId: string, accountId: string, input: { page?: number; limit?: number; startDate?: string; endDate?: string }) {
      const account = ensureAccountOwnership(await repository.findAccountById(accountId), userId);
      const page = Number.isFinite(input.page ?? NaN) ? Math.max(1, Number(input.page)) : 1;
      const limit = Number.isFinite(input.limit ?? NaN) ? Math.min(100, Math.max(1, Number(input.limit))) : 20;

      const { transactions, total } = await repository.listTransactions({
        accountId,
        page,
        limit,
        startDate: input.startDate,
        endDate: input.endDate,
      });

      return {
        account: {
          id: account.id,
          accountNumber: account.account_number,
          agency: account.agency,
          type: account.type,
          currentBalance: Number(account.balance),
          currentBalanceFormatted: formatBRL(Number(account.balance)),
        },
        pagination: {
          total,
          page,
          limit,
          pages: Math.max(1, Math.ceil(total / limit)),
        },
        transactions: transactions.map(toTransactionResponse),
      };
    },
  };
}