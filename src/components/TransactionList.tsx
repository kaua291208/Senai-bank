'use client';
import React from 'react';
import {
  Box, Typography, Chip, Divider, Skeleton,
} from '@mui/material';
import {
  AddCircle, RemoveCircle, SwapHoriz, TrendingUp,
} from '@mui/icons-material';

interface Transaction {
  id: string;
  type: string;
  typeLabel: string;
  amount: number;
  amountFormatted: string;
  description: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
}

interface Props {
  transactions: Transaction[];
  loading?: boolean;
}

const typeConfig: Record<string, { color: string; bg: string; icon: React.ReactNode; sign: string }> = {
  deposit: {
    color: '#00D97E', bg: 'rgba(0,217,126,0.1)',
    icon: <AddCircle sx={{ fontSize: 20 }} />, sign: '+',
  },
  withdraw: {
    color: '#F87171', bg: 'rgba(248,113,113,0.1)',
    icon: <RemoveCircle sx={{ fontSize: 20 }} />, sign: '-',
  },
  transfer_out: {
    color: '#6366F1', bg: 'rgba(99,102,241,0.1)',
    icon: <SwapHoriz sx={{ fontSize: 20 }} />, sign: '-',
  },
  transfer_in: {
    color: '#00D97E', bg: 'rgba(0,217,126,0.1)',
    icon: <TrendingUp sx={{ fontSize: 20 }} />, sign: '+',
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function TransactionList({ transactions, loading }: Props) {
  if (loading) {
    return (
      <Box>
        {[1, 2, 3, 4].map((i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
            <Skeleton variant="circular" width={44} height={44} />
            <Box sx={{ flex: 1 }}>
              <Skeleton width="60%" height={20} />
              <Skeleton width="40%" height={16} />
            </Box>
            <Skeleton width={80} height={24} />
          </Box>
        ))}
      </Box>
    );
  }

  if (!transactions.length) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography sx={{ color: '#94A3B8', fontSize: '0.9rem' }}>
          Nenhuma transação encontrada
        </Typography>
      </Box>
    );
  }

  // Group by date
  const grouped: Record<string, Transaction[]> = {};
  transactions.forEach((tx) => {
    const day = new Date(tx.createdAt).toLocaleDateString('pt-BR');
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(tx);
  });

  return (
    <Box>
      {Object.entries(grouped).map(([date, txs]) => (
        <Box key={date}>
          <Typography sx={{ color: '#64748B', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', py: 1.5 }}>
            {date}
          </Typography>
          {txs.map((tx, i) => {
            const cfg = typeConfig[tx.type] || typeConfig.deposit;
            return (
              <Box key={tx.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5 }}>
                  {/* Icon */}
                  <Box sx={{
                    width: 44, height: 44, borderRadius: '12px',
                    background: cfg.bg, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: cfg.color, flexShrink: 0,
                  }}>
                    {cfg.icon}
                  </Box>

                  {/* Info */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#F1F5F9' }}>
                      {tx.typeLabel}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tx.description || '—'}
                    </Typography>
                  </Box>

                  {/* Amount */}
                  <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: cfg.color }}>
                      {cfg.sign} {tx.amountFormatted}
                    </Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748B' }}>
                      {new Date(tx.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                </Box>
                {i < txs.length - 1 && (
                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.04)', ml: 7 }} />
                )}
              </Box>
            );
          })}
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 0.5 }} />
        </Box>
      ))}
    </Box>
  );
}
