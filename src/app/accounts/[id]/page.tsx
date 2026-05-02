'use client';
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Grid,
  TextField, Pagination, Alert, Skeleton, Chip,
  IconButton, Tooltip, Snackbar,
} from '@mui/material';
import {
  ArrowBack, AddCircleOutline, RemoveCircleOutline,
  SwapHoriz, FilterList, Refresh,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import TransactionList from '@/components/TransactionList';
import { DepositModal, WithdrawModal, TransferModal } from '@/components/TransactionModals';
import { accountsAPI, transactionsAPI } from '@/services/api';

interface Balance {
  accountId: string; accountNumber: string; agency: string;
  type: string; balance: number; balanceFormatted: string; updatedAt: string;
}

interface StatementData {
  account: { id: string; accountNumber: string; agency: string; type: string; currentBalance: number; currentBalanceFormatted: string };
  pagination: { total: number; page: number; limit: number; pages: number };
  transactions: any[];
}

export default function AccountDetailPage() {
  const router = useRouter();
  const params = useParams();
  const accountId = params.id as string;

  const [balance, setBalance] = useState<Balance | null>(null);
  const [statement, setStatement] = useState<StatementData | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [loadingStatement, setLoadingStatement] = useState(true);
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [snack, setSnack] = useState('');

  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  const fetchBalance = async () => {
    setLoadingBalance(true);
    try {
      const res = await accountsAPI.getBalance(accountId);
      setBalance(res.data);
    } catch { setError('Erro ao carregar conta.'); }
    setLoadingBalance(false);
  };

  const fetchStatement = async (p = 1) => {
    setLoadingStatement(true);
    try {
      const res = await transactionsAPI.getStatement(accountId, {
        startDate: startDate || undefined, endDate: endDate || undefined,
        page: p, limit: 20,
      });
      setStatement(res.data);
    } catch { }
    setLoadingStatement(false);
  };

  useEffect(() => { fetchBalance(); fetchStatement(); }, [accountId]);

  const handleSuccess = () => {
    fetchBalance(); fetchStatement(1);
    setSnack('Operação realizada com sucesso!');
  };

  const typeLabel = balance?.type === 'poupança' ? 'Poupança' : 'Corrente';
  const accentColor = balance?.type === 'poupança' ? '#00D97E' : '#6366F1';

  return (
    <Box sx={{ minHeight: '100vh', background: '#060B18' }}>
      <Navbar />

      <Box sx={{ maxWidth: 1000, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>
        {/* Back button */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/dashboard')}
          sx={{ color: '#94A3B8', mb: 3, '&:hover': { color: '#F1F5F9' } }}
        >
          Voltar ao Dashboard
        </Button>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* Balance card */}
        <Card sx={{
          mb: 3, background: `linear-gradient(145deg, ${accentColor}10 0%, #0F1629 100%)`,
          border: `1px solid ${accentColor}22`,
        }}>
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={7}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Chip label={typeLabel} size="small" sx={{ background: `${accentColor}20`, color: accentColor, fontWeight: 700 }} />
                  {loadingBalance
                    ? <Skeleton width={120} />
                    : <Typography sx={{ color: '#94A3B8', fontSize: '0.8rem' }}>
                        AG {balance?.agency} • CC {balance?.accountNumber}
                      </Typography>}
                </Box>
                <Typography sx={{ color: '#94A3B8', fontSize: '0.75rem', letterSpacing: '0.08em', mb: 0.5 }}>
                  SALDO DISPONÍVEL
                </Typography>
                {loadingBalance
                  ? <Skeleton width={200} height={56} />
                  : <Typography variant="h3" sx={{ fontWeight: 800, color: accentColor, letterSpacing: '-0.02em' }}>
                      {balance?.balanceFormatted}
                    </Typography>}
                {balance && (
                  <Typography sx={{ color: '#475569', fontSize: '0.75rem', mt: 1 }}>
                    Atualizado em {new Date(balance.updatedAt).toLocaleString('pt-BR')}
                  </Typography>
                )}
              </Grid>

              {/* Action buttons */}
              <Grid item xs={12} md={5}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Button
                    variant="contained" fullWidth startIcon={<AddCircleOutline />}
                    onClick={() => setDepositOpen(true)}
                    sx={{ justifyContent: 'flex-start', pl: 2, background: 'rgba(0,217,126,0.15)', color: '#00D97E', border: '1px solid rgba(0,217,126,0.2)', '&:hover': { background: 'rgba(0,217,126,0.25)' } }}
                  >
                    Depositar
                  </Button>
                  <Button
                    variant="contained" fullWidth startIcon={<RemoveCircleOutline />}
                    onClick={() => setWithdrawOpen(true)}
                    sx={{ justifyContent: 'flex-start', pl: 2, background: 'rgba(248,113,113,0.1)', color: '#F87171', border: '1px solid rgba(248,113,113,0.2)', '&:hover': { background: 'rgba(248,113,113,0.2)' } }}
                  >
                    Sacar
                  </Button>
                  <Button
                    variant="contained" fullWidth startIcon={<SwapHoriz />}
                    onClick={() => setTransferOpen(true)}
                    sx={{ justifyContent: 'flex-start', pl: 2, background: 'rgba(99,102,241,0.1)', color: '#6366F1', border: '1px solid rgba(99,102,241,0.2)', '&:hover': { background: 'rgba(99,102,241,0.2)' } }}
                  >
                    Transferir
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Statement */}
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Extrato</Typography>
                {statement && (
                  <Chip label={`${statement.pagination.total} transações`} size="small"
                    sx={{ background: 'rgba(99,102,241,0.1)', color: '#6366F1', fontWeight: 600 }} />
                )}
              </Box>
              <Tooltip title="Atualizar">
                <IconButton onClick={() => fetchStatement(page)} size="small" sx={{ color: '#94A3B8' }}>
                  <Refresh fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Filters */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <TextField
                label="Data inicial" type="date" size="small" value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }} sx={{ flex: 1, minWidth: 150 }}
              />
              <TextField
                label="Data final" type="date" size="small" value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }} sx={{ flex: 1, minWidth: 150 }}
              />
              <Button
                variant="outlined" startIcon={<FilterList />}
                onClick={() => { setPage(1); fetchStatement(1); }}
                sx={{ borderColor: 'rgba(255,255,255,0.1)', color: '#94A3B8', borderRadius: 3 }}
              >
                Filtrar
              </Button>
            </Box>

            <TransactionList
              transactions={statement?.transactions || []}
              loading={loadingStatement}
            />

            {statement && statement.pagination.pages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={statement.pagination.pages} page={page}
                  onChange={(_, p) => { setPage(p); fetchStatement(p); }}
                  sx={{ '& .MuiPaginationItem-root': { color: '#94A3B8', '&.Mui-selected': { background: 'rgba(0,217,126,0.15)', color: '#00D97E' } } }}
                />
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Modals */}
      <DepositModal open={depositOpen} onClose={() => setDepositOpen(false)} accountId={accountId} onSuccess={handleSuccess} />
      <WithdrawModal open={withdrawOpen} onClose={() => setWithdrawOpen(false)} accountId={accountId} onSuccess={handleSuccess} />
      <TransferModal open={transferOpen} onClose={() => setTransferOpen(false)} accountId={accountId} onSuccess={handleSuccess} />

      <Snackbar open={Boolean(snack)} autoHideDuration={4000} onClose={() => setSnack('')} message={snack} />
    </Box>
  );
}
