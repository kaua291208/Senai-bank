create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cpf text not null unique,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  revoked boolean not null default false,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null check (type in ('corrente', 'poupança')),
  agency text not null default '0001',
  account_number text not null unique,
  balance numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  related_account_id uuid references public.accounts(id) on delete set null,
  type text not null check (type in ('deposit', 'withdraw', 'transfer_in', 'transfer_out')),
  amount numeric(14,2) not null check (amount > 0),
  description text,
  balance_before numeric(14,2) not null,
  balance_after numeric(14,2) not null,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_updated_at on public.users;
create trigger users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists accounts_updated_at on public.accounts;
create trigger accounts_updated_at
before update on public.accounts
for each row execute function public.set_updated_at();

create sequence if not exists public.account_number_seq start 10000000;

create or replace function public.next_account_number()
returns text
language sql
as $$
  select lpad(nextval('public.account_number_seq')::text, 8, '0');
$$;