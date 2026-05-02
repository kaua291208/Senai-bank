'use client';
import React, { useState } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  InputAdornment, IconButton, Alert, Link, Stepper, Step, StepLabel,
} from '@mui/material';
import { Visibility, VisibilityOff, AccountBalanceWallet, CheckCircle } from '@mui/icons-material';
import NextLink from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

function formatCPF(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isStrongPassword(value: string) {
  return value.length >= 8 && /[A-Za-z]/.test(value) && /\d/.test(value);
}

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', cpf: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === 'cpf' ? formatCPF(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const name = form.name.trim();
    const cpfDigits = onlyDigits(form.cpf);
    const email = form.email.trim();
    const password = form.password;

    if (!name) {
      setError('Informe seu nome completo.');
      return;
    }

    if (cpfDigits.length !== 11) {
      setError('Informe um CPF válido com 11 dígitos.');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Informe um e-mail válido.');
      return;
    }

    if (!isStrongPassword(password)) {
      setError('A senha deve ter no mínimo 8 caracteres, com letras e números.');
      return;
    }

    if (password !== form.confirm) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await register({ name, cpf: cpfDigits, email, password });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box sx={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(ellipse at 50% 50%, rgba(0,217,126,0.1) 0%, transparent 70%), #060B18',
      }}>
        <Card sx={{ maxWidth: 400, width: '100%' }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 64, color: '#00D97E', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Conta criada!</Typography>
            <Typography sx={{ color: '#94A3B8', mb: 3 }}>
              Sua conta foi criada com sucesso. Faça login para começar.
            </Typography>
            <Button component={NextLink} href="/login" variant="contained" fullWidth size="large">
              Ir para o Login
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 80% 80%, rgba(99,102,241,0.08) 0%, transparent 60%), radial-gradient(ellipse at 20% 20%, rgba(0,217,126,0.06) 0%, transparent 60%), #060B18',
      p: 2,
    }}>
      <Box sx={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      <Card sx={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
            <Box sx={{
              width: 44, height: 44, borderRadius: '12px',
              background: 'linear-gradient(135deg, #00D97E, #00A85F)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AccountBalanceWallet sx={{ color: '#060B18', fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ lineHeight: 1, fontWeight: 700 }}>Carteira</Typography>
              <Typography variant="caption" sx={{ color: '#00D97E', fontWeight: 600, letterSpacing: '0.1em' }}>DIGITAL</Typography>
            </Box>
          </Box>

          <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 700 }}>Criar conta</Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>
            Preencha os dados para se cadastrar
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Nome completo" name="name" value={form.name} onChange={handleChange} fullWidth required />
            <TextField
              label="CPF" name="cpf" value={form.cpf} onChange={handleChange}
              fullWidth required placeholder="000.000.000-00"
              inputProps={{ maxLength: 14 }}
            />
            <TextField label="E-mail" name="email" type="email" value={form.email} onChange={handleChange} fullWidth required />
            <TextField
              label="Senha" name="password" type={showPass ? 'text' : 'password'}
              value={form.password} onChange={handleChange} fullWidth required
              helperText="Mínimo 8 caracteres, com letras e números"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPass(!showPass)} edge="end" size="small">
                      {showPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Confirmar senha" name="confirm" type={showPass ? 'text' : 'password'}
              value={form.confirm} onChange={handleChange} fullWidth required
            />

            <Button
              type="submit" variant="contained" size="large" fullWidth
              disabled={loading} sx={{ mt: 1, py: 1.4, fontSize: '1rem', fontWeight: 700 }}
            >
              {loading ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </Box>

          <Typography variant="body2" sx={{ textAlign: 'center', color: '#94A3B8', mt: 3 }}>
            Já tem conta?{' '}
            <Link component={NextLink} href="/login" sx={{ color: '#00D97E', fontWeight: 600 }}>
              Fazer login
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
