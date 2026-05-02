'use client';
import React, { useState } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  InputAdornment, IconButton, Alert, Link, Divider,
} from '@mui/material';
import { Visibility, VisibilityOff, AccountBalanceWallet } from '@mui/icons-material';
import NextLink from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at 20% 50%, rgba(0,217,126,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.08) 0%, transparent 60%), #060B18',
        p: 2,
      }}
    >
      {/* Decorative grid */}
      <Box sx={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      <Card sx={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
            <Box sx={{
              width: 44, height: 44, borderRadius: '12px',
              background: 'linear-gradient(135deg, #00D97E, #00A85F)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AccountBalanceWallet sx={{ color: '#060B18', fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ lineHeight: 1, color: '#F1F5F9', fontWeight: 700 }}>
                Carteira
              </Typography>
              <Typography variant="caption" sx={{ color: '#00D97E', fontWeight: 600, letterSpacing: '0.1em' }}>
                DIGITAL
              </Typography>
            </Box>
          </Box>

          <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 700, color: '#F1F5F9' }}>
            Bem-vindo de volta
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>
            Entre na sua conta para continuar
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="E-mail"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              required
              autoComplete="email"
            />
            <TextField
              label="Senha"
              name="password"
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              fullWidth
              required
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

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              sx={{ mt: 1, py: 1.4, fontSize: '1rem', fontWeight: 700 }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </Box>

          <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.06)' }} />

          <Typography variant="body2" sx={{ textAlign: 'center', color: '#94A3B8' }}>
            Não tem conta?{' '}
            <Link component={NextLink} href="/register" sx={{ color: '#00D97E', fontWeight: 600 }}>
              Criar conta grátis
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
