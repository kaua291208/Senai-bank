'use client';
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Grid, Card, CardContent,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Alert,
  Skeleton, CircularProgress, Snackbar,
} from '@mui/material';
import { Add, AccountBalance, TrendingUp, CreditCard } from '@mui/icons-material';
import Navbar from '@/components/Navbar';
import AccountCard from '@/components/AccountCard';
import { accountsAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface Account {
  id: string; accountNumber: string; agency: string;
  type: string; balance: number; balanceFormatted: string; owner: string; createdAt: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newType, setNewType] = useState<'corrente' | 'poupança'>('corrente');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [snack, setSnack] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAccounts = async () => {
    try {
      const res = await accountsAPI.list();
      setAccounts(res.data.accounts || []);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { fetchAccounts(); }, []);

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const totalFormatted = totalBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleCreate = async () => {
    setCreateError(''); setCreating(true);
    try {
      await accountsAPI.create({ type: newType });
      await fetchAccounts();
      setCreateOpen(false);
      setSnack('Conta criada com sucesso!');
    } catch (err: any) {
      setCreateError(err.response?.data?.error || 'Erro ao criar conta.');
    } finally { setCreating(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await accountsAPI.delete(deleteId);
      await fetchAccounts();
      setDeleteId(null);
      setSnack('Conta encerrada.');
    } catch (err: any) {
      setSnack(err.response?.data?.error || 'Erro ao encerrar conta.');
      setDeleteId(null);
    } finally { setDeleting(false); }
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const firstName = user?.name?.split(' ')[0] || '';

  return (
    <Box sx={{ minHeight: '100vh', background: '#060B18' }}>
      <Navbar />

      <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ color: '#94A3B8', fontSize: '0.85rem', mb: 0.5 }}>
            {greeting},
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#F1F5F9', letterSpacing: '-0.02em' }}>
            {firstName} 👋
          </Typography>
        </Box>

        {/* Summary cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography sx={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em' }}>
                    SALDO TOTAL
                  </Typography>
                  <Box sx={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(0,217,126,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrendingUp sx={{ color: '#00D97E', fontSize: 16 }} />
                  </Box>
                </Box>
                {loading
                  ? <Skeleton width={140} height={40} />
                  : <Typography variant="h5" sx={{ fontWeight: 800, color: '#00D97E' }}>{totalFormatted}</Typography>}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={4}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography sx={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em' }}>
                    CONTAS
                  </Typography>
                  <Box sx={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AccountBalance sx={{ color: '#6366F1', fontSize: 16 }} />
                  </Box>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#F1F5F9' }}>{accounts.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={4}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography sx={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em' }}>
                    TIPO DE CONTA
                  </Typography>
                  <Box sx={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(251,191,36,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CreditCard sx={{ color: '#FBBF24', fontSize: 16 }} />
                  </Box>
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#F1F5F9' }}>
                  {accounts.filter(a => a.type === 'corrente').length}C / {accounts.filter(a => a.type !== 'corrente').length}P
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Accounts section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#F1F5F9' }}>
            Minhas Contas
          </Typography>
          <Button
            variant="contained" startIcon={<Add />}
            onClick={() => setCreateOpen(true)}
            sx={{ borderRadius: 3 }}
          >
            Nova Conta
          </Button>
        </Box>

        {loading ? (
          <Grid container spacing={2}>
            {[1, 2].map(i => (
              <Grid item xs={12} md={6} key={i}>
                <Skeleton variant="rectangular" height={180} sx={{ borderRadius: '20px' }} />
              </Grid>
            ))}
          </Grid>
        ) : accounts.length === 0 ? (
          <Card sx={{ textAlign: 'center', py: 6 }}>
            <AccountBalance sx={{ fontSize: 48, color: '#334155', mb: 2 }} />
            <Typography sx={{ color: '#94A3B8', mb: 2 }}>
              Você ainda não tem contas abertas.
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => setCreateOpen(true)}>
              Abrir primeira conta
            </Button>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {accounts.map(account => (
              <Grid item xs={12} md={6} key={account.id}>
                <AccountCard account={account} onDelete={(id) => setDeleteId(id)} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Create account dialog */}
      <Dialog open={createOpen} onClose={() => { setCreateOpen(false); setCreateError(''); }} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Nova Conta Bancária</DialogTitle>
        <DialogContent>
          {createError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{createError}</Alert>}
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Tipo de conta</InputLabel>
            <Select
              value={newType}
              label="Tipo de conta"
              onChange={(e) => setNewType(e.target.value as any)}
              sx={{ borderRadius: 3 }}
            >
              <MenuItem value="corrente">Conta Corrente</MenuItem>
              <MenuItem value="poupança">Conta Poupança</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setCreateOpen(false)} variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.1)', color: '#94A3B8' }}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} variant="contained" disabled={creating}>
            {creating ? <CircularProgress size={20} /> : 'Criar conta'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#F87171' }}>Encerrar Conta</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#94A3B8' }}>
            Tem certeza que deseja encerrar esta conta? O saldo deve estar zerado.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setDeleteId(null)} variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.1)', color: '#94A3B8' }}>
            Cancelar
          </Button>
          <Button onClick={handleDelete} disabled={deleting} sx={{ background: '#F87171', color: '#fff', '&:hover': { background: '#ef4444' }, borderRadius: 2, px: 3, fontWeight: 700 }}>
            {deleting ? 'Encerrando...' : 'Encerrar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(snack)} autoHideDuration={4000} onClose={() => setSnack('')} message={snack} />
    </Box>
  );
}
