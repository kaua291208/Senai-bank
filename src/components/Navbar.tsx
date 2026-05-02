'use client';
import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Box, IconButton, Avatar,
  Menu, MenuItem, Divider, ListItemIcon, Chip,
} from '@mui/material';
import {
  AccountBalanceWallet, Logout, Person, KeyboardArrowDown,
} from '@mui/icons-material';
import NextLink from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: 'rgba(6,11,24,0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        zIndex: 100,
      }}
    >
      <Toolbar sx={{ px: { xs: 2, md: 4 }, minHeight: 64 }}>
        {/* Logo */}
        <Box component={NextLink} href="/dashboard" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none' }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: '10px',
            background: 'linear-gradient(135deg, #00D97E, #00A85F)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AccountBalanceWallet sx={{ color: '#060B18', fontSize: 18 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1, color: '#F1F5F9' }}>
              Carteira
            </Typography>
            <Typography sx={{ fontSize: '0.6rem', color: '#00D97E', fontWeight: 700, letterSpacing: '0.12em' }}>
              DIGITAL
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flex: 1 }} />

        {/* User menu */}
        <Box
          onClick={(e) => setAnchor(e.currentTarget)}
          sx={{
            display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer',
            borderRadius: 3, px: 1.5, py: 0.75,
            border: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.03)',
            '&:hover': { background: 'rgba(255,255,255,0.06)' },
            transition: 'background 0.2s',
          }}
        >
          <Avatar sx={{
            width: 32, height: 32, fontSize: '0.75rem', fontWeight: 700,
            background: 'linear-gradient(135deg, #00D97E, #00A85F)',
            color: '#060B18',
          }}>
            {initials}
          </Avatar>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.2, color: '#F1F5F9' }}>
              {user?.name?.split(' ')[0]}
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8' }}>
              {user?.email}
            </Typography>
          </Box>
          <KeyboardArrowDown sx={{ color: '#94A3B8', fontSize: 18 }} />
        </Box>

        <Menu
          anchorEl={anchor}
          open={Boolean(anchor)}
          onClose={() => setAnchor(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              mt: 1, minWidth: 200,
              background: '#0F1629',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 3,
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.name}</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8' }}>{user?.email}</Typography>
          </Box>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
          <MenuItem onClick={() => setAnchor(null)} sx={{ gap: 1.5, py: 1.2 }}>
            <ListItemIcon><Person fontSize="small" sx={{ color: '#94A3B8' }} /></ListItemIcon>
            <Typography fontSize="0.9rem">Meu perfil</Typography>
          </MenuItem>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
          <MenuItem
            onClick={() => { setAnchor(null); logout(); }}
            sx={{ gap: 1.5, py: 1.2, color: '#F87171' }}
          >
            <ListItemIcon><Logout fontSize="small" sx={{ color: '#F87171' }} /></ListItemIcon>
            <Typography fontSize="0.9rem">Sair</Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
