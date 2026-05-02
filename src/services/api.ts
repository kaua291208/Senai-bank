import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://senai-bank-c7om-ie9lnpe02-kaua291208s-projects.vercel.app';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Injeta token em todas as requisições
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redireciona para login em 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ───────────────────────────────────────────────────
export const authAPI = {
  register: (data: { name: string; cpf: string; email: string; password: string }) =>
    api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  me: () => api.get('/auth/me'),
};

// ─── Accounts ───────────────────────────────────────────────
export const accountsAPI = {
  list: () => api.get('/accounts'),

  create: (data: { type: 'corrente' | 'poupança' }) =>
    api.post('/accounts', data),

  updateUser: (data: { name?: string; email?: string }) =>
    api.put('/accounts/me', data),

  delete: (id: string) => api.delete(`/accounts/${id}`),

  getBalance: (id: string) => api.get(`/accounts/${id}/balance`),
};

// ─── Transactions ────────────────────────────────────────────
export const transactionsAPI = {
  deposit: (accountId: string, data: { amount: number; description?: string }) =>
    api.post(`/accounts/${accountId}/deposit`, data),

  withdraw: (accountId: string, data: { amount: number; description?: string }) =>
    api.post(`/accounts/${accountId}/withdraw`, data),

  transfer: (
    accountId: string,
    data: { toAccountNumber: string; amount: number; description?: string }
  ) => api.post(`/accounts/${accountId}/transfer`, data),

  getStatement: (
    accountId: string,
    params?: { startDate?: string; endDate?: string; limit?: number; page?: number }
  ) => api.get(`/accounts/${accountId}/statement`, { params }),
};

export default api;
