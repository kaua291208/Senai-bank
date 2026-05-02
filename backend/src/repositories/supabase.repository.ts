import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  AccountRow,
  SessionRow,
  TransactionRow,
  UserRow,
} from '../types.js';
import type {
  CreateAccountInput,
  CreateSessionInput,
  CreateTransactionInput,
  CreateUserInput,
  DatabaseRepository,
  ListTransactionsInput,
  UpdateUserInput,
} from './database.repository.js';

function ensureSupabaseError(error: { message: string } | null) {
  if (error) {
    throw new Error(error.message);
  }
}

function startOfDay(isoDate: string) {
  return `${isoDate}T00:00:00.000Z`;
}

function endOfDay(isoDate: string) {
  return `${isoDate}T23:59:59.999Z`;
}

export class SupabaseRepository implements DatabaseRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findUserByCpf(cpf: string) {
    const { data, error } = await this.client.from('users').select('*').eq('cpf', cpf).maybeSingle();
    ensureSupabaseError(error);
    return data as UserRow | null;
  }

  async findUserByEmail(email: string) {
    const { data, error } = await this.client.from('users').select('*').eq('email', email).maybeSingle();
    ensureSupabaseError(error);
    return data as UserRow | null;
  }

  async findUserById(userId: string) {
    const { data, error } = await this.client.from('users').select('*').eq('id', userId).maybeSingle();
    ensureSupabaseError(error);
    return data as UserRow | null;
  }

  async createUser(input: CreateUserInput) {
    const { data, error } = await this.client
      .from('users')
      .insert({
        name: input.name,
        cpf: input.cpf,
        email: input.email,
        password_hash: input.passwordHash,
      })
      .select('*')
      .single();
    ensureSupabaseError(error);
    return data as UserRow;
  }

  async updateUser(userId: string, input: UpdateUserInput) {
    const payload: Record<string, string> = {};
    if (input.name !== undefined) payload.name = input.name;
    if (input.email !== undefined) payload.email = input.email;

    const { data, error } = await this.client
      .from('users')
      .update(payload)
      .eq('id', userId)
      .select('*')
      .single();
    ensureSupabaseError(error);
    return data as UserRow;
  }

  async createSession(input: CreateSessionInput) {
    const { data, error } = await this.client
      .from('sessions')
      .insert({ user_id: input.userId, expires_at: input.expiresAt, revoked: false })
      .select('*')
      .single();
    ensureSupabaseError(error);
    return data as SessionRow;
  }

  async findSessionById(sessionId: string) {
    const { data, error } = await this.client.from('sessions').select('*').eq('id', sessionId).maybeSingle();
    ensureSupabaseError(error);
    return data as SessionRow | null;
  }

  async revokeSession(sessionId: string) {
    const { error } = await this.client.from('sessions').update({ revoked: true }).eq('id', sessionId);
    ensureSupabaseError(error);
  }

  async listAccounts(userId: string) {
    const { data, error } = await this.client
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    ensureSupabaseError(error);
    return (data || []) as AccountRow[];
  }

  async findAccountById(accountId: string) {
    const { data, error } = await this.client.from('accounts').select('*').eq('id', accountId).maybeSingle();
    ensureSupabaseError(error);
    return data as AccountRow | null;
  }

  async findAccountByAccountNumber(accountNumber: string) {
    const { data, error } = await this.client.from('accounts').select('*').eq('account_number', accountNumber).maybeSingle();
    ensureSupabaseError(error);
    return data as AccountRow | null;
  }

  async createAccount(input: CreateAccountInput) {
    const { data: accountNumberData, error: accountNumberError } = await this.client.rpc('next_account_number');
    ensureSupabaseError(accountNumberError);

    const accountNumber = accountNumberData as string;

    const { data, error } = await this.client
      .from('accounts')
      .insert({
        user_id: input.userId,
        type: input.type,
        account_number: accountNumber,
      })
      .select('*')
      .single();
    ensureSupabaseError(error);
    return data as AccountRow;
  }

  async updateAccountBalance(accountId: string, balance: number) {
    const { data, error } = await this.client
      .from('accounts')
      .update({ balance })
      .eq('id', accountId)
      .select('*')
      .single();
    ensureSupabaseError(error);
    return data as AccountRow;
  }

  async deleteAccount(accountId: string) {
    const { error } = await this.client.from('accounts').delete().eq('id', accountId);
    ensureSupabaseError(error);
  }

  async createTransaction(input: CreateTransactionInput) {
    const { data, error } = await this.client
      .from('transactions')
      .insert({
        account_id: input.accountId,
        related_account_id: input.relatedAccountId,
        type: input.type,
        amount: input.amount,
        description: input.description,
        balance_before: input.balanceBefore,
        balance_after: input.balanceAfter,
      })
      .select('*')
      .single();
    ensureSupabaseError(error);
    return data as TransactionRow;
  }

  async listTransactions(input: ListTransactionsInput) {
    const page = Math.max(1, input.page);
    const limit = Math.max(1, input.limit);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = this.client
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('account_id', input.accountId)
      .order('created_at', { ascending: false });

    if (input.startDate) {
      query = query.gte('created_at', startOfDay(input.startDate));
    }

    if (input.endDate) {
      query = query.lte('created_at', endOfDay(input.endDate));
    }

    const { data, count, error } = await query.range(from, to);
    ensureSupabaseError(error);

    return {
      transactions: (data || []) as TransactionRow[],
      total: count || 0,
    };
  }
}