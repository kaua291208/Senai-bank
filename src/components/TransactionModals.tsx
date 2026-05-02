'use client';
import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, Box, InputAdornment,
  Alert, CircularProgress,
} from '@mui/material';
import {
  AddCircleOutline, RemoveCircleOutline, SwapHoriz,
} from '@mui/icons-material';
import { transactionsAPI } from '@/services/api';

interface BaseModalProps {
  open: boolean;
  onClose: () => void;
  accountId: string;
  onSuccess: () => void;
}

// ─── Deposit ─────────────────────────────────────────────────
export function DepositModal({ open, onClose, accountId, onSuccess }: BaseModalProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => { setAmount(''); setDescription(''); setError(''); onClose(); };

  const handleSubmit = async () => {
    setError(''); setLoading(true);
    try {
      await transactionsAPI.deposit(accountId, { amount: parseFloat(amount), description });
      onSuccess(); handleClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao realizar depósito.');
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(0,217,126,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AddCircleOutline sx={{ color: '#00D97E', fontSize: 20 }} />
          </Box>
          <Typography variant="h6" fontWeight={700}>Depósito</Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
        <TextField
          label="Valor" value={amount} onChange={(e) => setAmount(e.target.value)}
          fullWidth type="number" inputProps={{ min: 0.01, max: 1000000, step: 0.01 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Typography sx={{ color: '#94A3B8', fontWeight: 600 }}>R$</Typography></InputAdornment> }}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Descrição (opcional)" value={description}
          onChange={(e) => setDescription(e.target.value)} fullWidth
        />
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={handleClose} variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.1)', color: '#94A3B8' }}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!amount || loading} startIcon={loading ? <CircularProgress size={16} /> : undefined}>
          {loading ? 'Depositando...' : 'Depositar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Withdraw ────────────────────────────────────────────────
export function WithdrawModal({ open, onClose, accountId, onSuccess }: BaseModalProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => { setAmount(''); setDescription(''); setError(''); onClose(); };

  const handleSubmit = async () => {
    setError(''); setLoading(true);
    try {
      await transactionsAPI.withdraw(accountId, { amount: parseFloat(amount), description });
      onSuccess(); handleClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao realizar saque.');
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(248,113,113,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RemoveCircleOutline sx={{ color: '#F87171', fontSize: 20 }} />
          </Box>
          <Typography variant="h6" fontWeight={700}>Saque</Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
        <TextField
          label="Valor" value={amount} onChange={(e) => setAmount(e.target.value)}
          fullWidth type="number" inputProps={{ min: 0.01, max: 1000000, step: 0.01 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Typography sx={{ color: '#94A3B8', fontWeight: 600 }}>R$</Typography></InputAdornment> }}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Descrição (opcional)" value={description}
          onChange={(e) => setDescription(e.target.value)} fullWidth
        />
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={handleClose} variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.1)', color: '#94A3B8' }}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={!amount || loading} sx={{ background: '#F87171', color: '#fff', '&:hover': { background: '#ef4444' }, borderRadius: 2, px: 3, fontWeight: 700 }}>
          {loading ? 'Sacando...' : 'Sacar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Transfer ────────────────────────────────────────────────
interface TransferModalProps extends BaseModalProps {}

export function TransferModal({ open, onClose, accountId, onSuccess }: TransferModalProps) {
  const [toAccountNumber, setToAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => { setToAccountNumber(''); setAmount(''); setDescription(''); setError(''); onClose(); };

  const handleSubmit = async () => {
    setError(''); setLoading(true);
    try {
      await transactionsAPI.transfer(accountId, { toAccountNumber, amount: parseFloat(amount), description });
      onSuccess(); handleClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao realizar transferência.');
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SwapHoriz sx={{ color: '#6366F1', fontSize: 20 }} />
          </Box>
          <Typography variant="h6" fontWeight={700}>Transferência</Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
        <TextField
          label="Número da conta destino" value={toAccountNumber}
          onChange={(e) => setToAccountNumber(e.target.value)} fullWidth
          placeholder="Ex: 10000001"
          helperText="Informe o número de conta que receberá a transferência"
        />
        <TextField
          label="Valor" value={amount} onChange={(e) => setAmount(e.target.value)}
          fullWidth type="number" inputProps={{ min: 0.01, step: 0.01 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Typography sx={{ color: '#94A3B8', fontWeight: 600 }}>R$</Typography></InputAdornment> }}
        />
        <TextField
          label="Descrição (opcional)" value={description}
          onChange={(e) => setDescription(e.target.value)} fullWidth
        />
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={handleClose} variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.1)', color: '#94A3B8' }}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={!amount || !toAccountNumber || loading} sx={{ background: '#6366F1', color: '#fff', '&:hover': { background: '#4F46E5' }, borderRadius: 2, px: 3, fontWeight: 700 }}>
          {loading ? 'Transferindo...' : 'Transferir'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
