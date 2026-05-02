function ensureSupabaseError(error) {
    if (error) {
        throw new Error(error.message);
    }
}
function startOfDay(isoDate) {
    return `${isoDate}T00:00:00.000Z`;
}
function endOfDay(isoDate) {
    return `${isoDate}T23:59:59.999Z`;
}
export class SupabaseRepository {
    constructor(client) {
        this.client = client;
    }
    async findUserByCpf(cpf) {
        const { data, error } = await this.client.from('users').select('*').eq('cpf', cpf).maybeSingle();
        ensureSupabaseError(error);
        return data;
    }
    async findUserByEmail(email) {
        const { data, error } = await this.client.from('users').select('*').eq('email', email).maybeSingle();
        ensureSupabaseError(error);
        return data;
    }
    async findUserById(userId) {
        const { data, error } = await this.client.from('users').select('*').eq('id', userId).maybeSingle();
        ensureSupabaseError(error);
        return data;
    }
    async createUser(input) {
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
        return data;
    }
    async updateUser(userId, input) {
        const payload = {};
        if (input.name !== undefined)
            payload.name = input.name;
        if (input.email !== undefined)
            payload.email = input.email;
        const { data, error } = await this.client
            .from('users')
            .update(payload)
            .eq('id', userId)
            .select('*')
            .single();
        ensureSupabaseError(error);
        return data;
    }
    async createSession(input) {
        const { data, error } = await this.client
            .from('sessions')
            .insert({ user_id: input.userId, expires_at: input.expiresAt, revoked: false })
            .select('*')
            .single();
        ensureSupabaseError(error);
        return data;
    }
    async findSessionById(sessionId) {
        const { data, error } = await this.client.from('sessions').select('*').eq('id', sessionId).maybeSingle();
        ensureSupabaseError(error);
        return data;
    }
    async revokeSession(sessionId) {
        const { error } = await this.client.from('sessions').update({ revoked: true }).eq('id', sessionId);
        ensureSupabaseError(error);
    }
    async listAccounts(userId) {
        const { data, error } = await this.client
            .from('accounts')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        ensureSupabaseError(error);
        return (data || []);
    }
    async findAccountById(accountId) {
        const { data, error } = await this.client.from('accounts').select('*').eq('id', accountId).maybeSingle();
        ensureSupabaseError(error);
        return data;
    }
    async createAccount(input) {
        const { data: accountNumberData, error: accountNumberError } = await this.client.rpc('next_account_number');
        ensureSupabaseError(accountNumberError);
        const accountNumber = accountNumberData;
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
        return data;
    }
    async updateAccountBalance(accountId, balance) {
        const { data, error } = await this.client
            .from('accounts')
            .update({ balance })
            .eq('id', accountId)
            .select('*')
            .single();
        ensureSupabaseError(error);
        return data;
    }
    async deleteAccount(accountId) {
        const { error } = await this.client.from('accounts').delete().eq('id', accountId);
        ensureSupabaseError(error);
    }
    async createTransaction(input) {
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
        return data;
    }
    async listTransactions(input) {
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
            transactions: (data || []),
            total: count || 0,
        };
    }
}
