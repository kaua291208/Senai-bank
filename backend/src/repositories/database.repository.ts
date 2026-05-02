import type { SupabaseClient } from '@supabase/supabase-js';
import type { AccountRow, AccountType, SessionRow, TransactionRow, UserRow } from '../types.js';

export interface CreateUserInput {
  name: string;
  cpf: string;
  email: string;
  passwordHash: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
}

export interface CreateAccountInput {
  userId: string;
  type: AccountType;
}

export interface CreateSessionInput {
  userId: string;
  expiresAt: string;
}

export interface CreateTransactionInput {
  accountId: string;
  relatedAccountId: string | null;
  type: TransactionRow['type'];
  amount: number;
  description: string | null;
  balanceBefore: number;
  balanceAfter: number;
}

export interface ListTransactionsInput {
  accountId: string;
  page: number;
  limit: number;
  startDate?: string;
  endDate?: string;
}

export interface DatabaseRepository {
  findUserByCpf(cpf: string): Promise<UserRow | null>;
  findUserByEmail(email: string): Promise<UserRow | null>;
  findUserById(userId: string): Promise<UserRow | null>;
  createUser(input: CreateUserInput): Promise<UserRow>;
  updateUser(userId: string, input: UpdateUserInput): Promise<UserRow>;

  createSession(input: CreateSessionInput): Promise<SessionRow>;
  findSessionById(sessionId: string): Promise<SessionRow | null>;
  revokeSession(sessionId: string): Promise<void>;

  listAccounts(userId: string): Promise<AccountRow[]>;
  findAccountById(accountId: string): Promise<AccountRow | null>;
  findAccountByAccountNumber(accountNumber: string): Promise<AccountRow | null>;
  createAccount(input: CreateAccountInput): Promise<AccountRow>;
  updateAccountBalance(accountId: string, balance: number): Promise<AccountRow>;
  deleteAccount(accountId: string): Promise<void>;

  createTransaction(input: CreateTransactionInput): Promise<TransactionRow>;
  listTransactions(input: ListTransactionsInput): Promise<{ transactions: TransactionRow[]; total: number }>;
}

export interface SupabaseRepositoryOptions {
  client: SupabaseClient;
}
