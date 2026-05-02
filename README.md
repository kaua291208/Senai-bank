# 💳 Carteira Digital — Frontend

Frontend completo para a API de Carteira Digital, construído com **Next.js 14 + MUI v5**.

## 🚀 Como rodar

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variável de ambiente

O arquivo `.env.local` já está criado. Edite caso seu backend rode em outra porta:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 3. Rodar o projeto

```bash
npm run dev
```

Acesse: **http://localhost:3001** (ou a porta disponível)

---

## 📁 Estrutura do projeto

```
src/
├── app/
│   ├── layout.tsx           # Layout raiz com providers
│   ├── page.tsx             # Redireciona para /login ou /dashboard
│   ├── login/page.tsx       # Página de login
│   ├── register/page.tsx    # Página de cadastro
│   ├── dashboard/page.tsx   # Dashboard principal (lista de contas)
│   └── accounts/[id]/page.tsx  # Detalhes da conta + extrato
│
├── components/
│   ├── Navbar.tsx           # Barra de navegação
│   ├── AccountCard.tsx      # Card de conta bancária
│   ├── TransactionList.tsx  # Lista de transações
│   └── TransactionModals.tsx  # Modais de Depósito, Saque e Transferência
│
├── contexts/
│   └── AuthContext.tsx      # Gerenciamento global de autenticação
│
├── services/
│   └── api.ts               # Cliente Axios com todos os endpoints
│
├── theme/
│   └── theme.ts             # Tema MUI customizado (dark fintech)
│
└── lib/
    └── MuiProvider.tsx      # Provider do MUI para App Router
```

## 🎯 Funcionalidades

| Tela | Funcionalidades |
|------|----------------|
| Login | Autenticação com JWT |
| Cadastro | Registro com CPF, nome, e-mail e senha |
| Dashboard | Listagem de contas, saldo total, criar conta |
| Conta | Saldo detalhado, depósito, saque, transferência, extrato com filtros de data e paginação |

## 🎨 Design

- **Tema**: Dark fintech (verde #00D97E + índigo #6366F1)
- **Font**: Syne (Google Fonts)
- **Componentes**: MUI v5 100% customizado
