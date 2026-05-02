'use client';
import React from 'react';
import { Box, Typography, Chip, IconButton, Tooltip } from '@mui/material';
import { AccountBalance, Savings, ArrowForward, Delete } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface Account {
  id: string;
  accountNumber: string;
  agency: string;
  type: string;
  balance: number;
  balanceFormatted: string;
  owner: string;
  createdAt: string;
}

interface Props {
  account: Account;
  onDelete?: (id: string) => void;
}

const gradients: Record<string, string> = {
  corrente: 'linear-gradient(135deg, #0F1E3C 0%, #1A2F5A 50%, #0D2247 100%)',
  poupança: 'linear-gradient(135deg, #0A2318 0%, #0F3320 50%, #082218 100%)',
  poupanca: 'linear-gradient(135deg, #0A2318 0%, #0F3320 50%, #082218 100%)',
};

export default function AccountCard({ account, onDelete }: Props) {
  const router = useRouter();
  const isSaving = account.type === 'poupança' || account.type === 'poupanca';
  const gradient = gradients[account.type] || gradients.corrente;
  const accentColor = isSaving ? '#00D97E' : '#6366F1';

  return (
    <Box
      sx={{
        background: gradient,
        borderRadius: '20px',
        border: `1px solid ${accentColor}22`,
        p: 3,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 16px 48px ${accentColor}22`,
        },
      }}
      onClick={() => router.push(`/accounts/${account.id}`)}
    >
      {/* Decorative circle */}
      <Box sx={{
        position: 'absolute', right: -30, top: -30,
        width: 120, height: 120, borderRadius: '50%',
        background: `${accentColor}10`,
        border: `1px solid ${accentColor}20`,
      }} />
      <Box sx={{
        position: 'absolute', right: 10, top: 10,
        width: 60, height: 60, borderRadius: '50%',
        background: `${accentColor}08`,
      }} />

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box sx={{
          width: 40, height: 40, borderRadius: '12px',
          background: `${accentColor}20`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {isSaving
            ? <Savings sx={{ color: accentColor, fontSize: 20 }} />
            : <AccountBalance sx={{ color: accentColor, fontSize: 20 }} />}
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip
            label={isSaving ? 'Poupança' : 'Corrente'}
            size="small"
            sx={{
              background: `${accentColor}15`,
              color: accentColor,
              fontWeight: 600,
              fontSize: '0.7rem',
              border: `1px solid ${accentColor}30`,
            }}
          />
          {onDelete && (
            <Tooltip title="Encerrar conta">
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); onDelete(account.id); }}
                sx={{ color: '#F87171', '&:hover': { background: 'rgba(248,113,113,0.1)' } }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Balance */}
      <Typography sx={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', mb: 0.5 }}>
        SALDO DISPONÍVEL
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 800, color: '#F1F5F9', mb: 2.5, letterSpacing: '-0.02em' }}>
        {account.balanceFormatted}
      </Typography>

      {/* Footer */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography sx={{ color: '#64748B', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em' }}>
            AG {account.agency} • CC {account.accountNumber}
          </Typography>
          <Typography sx={{ color: '#94A3B8', fontSize: '0.75rem', mt: 0.3 }}>
            {account.owner}
          </Typography>
        </Box>
        <Box sx={{
          width: 32, height: 32, borderRadius: '50%',
          background: `${accentColor}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1px solid ${accentColor}30`,
        }}>
          <ArrowForward sx={{ color: accentColor, fontSize: 16 }} />
        </Box>
      </Box>
    </Box>
  );
}
