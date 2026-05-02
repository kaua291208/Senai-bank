export type AccountType = 'corrente' | 'poupança';
export type TransactionType = 'deposit' | 'withdraw' | 'transfer_in' | 'transfer_out';

export interface UserRow {
  id: string;
  name: string;
  cpf: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface SessionRow {
  id: string;
  user_id: string;
  revoked: boolean;
  created_at: string;
  expires_at: string;
}

export interface AccountRow {
  id: string;
  user_id: string;
  type: AccountType;
  agency: string;
  account_number: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface TransactionRow {
  id: string;
  account_id: string;
  related_account_id: string | null;
  type: TransactionType;
  amount: number;
  description: string | null;
  balance_before: number;
  balance_after: number;
  created_at: string;
}