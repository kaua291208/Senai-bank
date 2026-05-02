import { supabase } from '../lib/supabase.js';
import { SupabaseRepository } from '../repositories/supabase.repository.js';
import { createAuthService } from './auth.service.js';
import { createAccountService } from './account.service.js';

const repository = new SupabaseRepository(supabase);

export const authService = createAuthService(repository);
export const accountService = createAccountService(repository);
export const databaseRepository = repository;