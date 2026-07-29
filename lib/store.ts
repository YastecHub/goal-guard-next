// lib/store.ts — GoalGuard Zustand Global State
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TransactionStatus = 'Direct Transfer' | 'AI Adjusted' | 'Canceled';
export type Persona = 'english' | 'pidgin' | 'genz' | 'merchant';

export interface Vault {
  id: string;
  name: string;
  saved: number;
  target: number;
  days: number;
}

export interface Transaction {
  id: string;
  date: string;
  type: string;
  recipient: string;
  amount: number;
  category: string;
  status: TransactionStatus;
}

export interface OnboardingState {
  userId: string;
  walletAddress: string;
  kycVerified: boolean;
  railActive: boolean;
  generalStatus: 'Not Onboarded' | 'In Progress' | 'Onboarded';
  currentStep: number;
}

export interface EvalResult {
  intercepted: boolean;
  tradeOffText: string;
  suggestedAmount: number;
  delayDays: number;
  personas: Record<Persona, string>;
}

export interface PendingTransfer {
  recipientAddress: string;
  recipientName: string;
  amount: number;
  category: string;
  evalResult: EvalResult | null;
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface GoalGuardStore {
  // Wallet state
  balance: number;
  vaults: Vault[];
  transactions: Transaction[];
  onboarding: OnboardingState;

  // UI state
  isMockMode: boolean;
  isDarkMode: boolean;
  persona: Persona;
  pendingTransfer: PendingTransfer | null;
  isInterceptOpen: boolean;

  // Actions
  setBalance: (b: number) => void;
  setVaults: (v: Vault[]) => void;
  depositToVault: (vaultId: string, amount: number) => void;
  withdrawFromVault: (vaultId: string, amount: number) => void;
  addTransaction: (t: Transaction) => void;
  setOnboarding: (o: OnboardingState) => void;
  setMockMode: (v: boolean) => void;
  toggleDarkMode: () => void;
  setPersona: (p: Persona) => void;
  setPendingTransfer: (pt: PendingTransfer | null) => void;
  openIntercept: () => void;
  closeIntercept: () => void;
  executeAdjusted: () => void;
  executeFull: () => void;
  cancelTransfer: () => void;
}

const INITIAL_VAULTS: Vault[] = [
  { id: 'v-1', name: 'Course Certification', saved: 65000, target: 100000, days: 20 },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 't-1', date: '2026-07-28', type: 'Debit',
    recipient: 'Netflix', amount: 4400, category: 'Entertainment',
    status: 'Direct Transfer',
  },
  {
    id: 't-2', date: '2026-07-25', type: 'Credit',
    recipient: 'Salary Inflow', amount: 100000, category: 'Income',
    status: 'Direct Transfer',
  },
  {
    id: 't-3', date: '2026-07-24', type: 'Credit',
    recipient: 'Gig Payout', amount: 54400, category: 'Freelance',
    status: 'Direct Transfer',
  },
];

const INITIAL_ONBOARDING: OnboardingState = {
  userId: '',
  walletAddress: '',
  kycVerified: false,
  railActive: false,
  generalStatus: 'Not Onboarded',
  currentStep: 0,
};

export const useStore = create<GoalGuardStore>()(
  persist(
    (set, get) => ({
      balance: 150000,
      vaults: INITIAL_VAULTS,
      transactions: INITIAL_TRANSACTIONS,
      onboarding: INITIAL_ONBOARDING,
      isMockMode: true,
      isDarkMode: false,
      persona: 'english',
      pendingTransfer: null,
      isInterceptOpen: false,

      setBalance: (b) => set({ balance: b }),
      setVaults: (v) => set({ vaults: v }),

      depositToVault: (vaultId, amount) => {
        const { balance, vaults, transactions } = get();
        if (balance < amount) throw new Error('Insufficient balance');
        const updated = vaults.map((v) =>
          v.id === vaultId ? { ...v, saved: v.saved + amount } : v
        );
        set({
          vaults: updated,
          balance: balance - amount,
          transactions: [
            {
              id: `t-${Date.now()}`,
              date: new Date().toISOString().split('T')[0],
              type: 'Debit',
              recipient: `Vault: ${updated.find((v) => v.id === vaultId)?.name}`,
              amount,
              category: 'Savings',
              status: 'Direct Transfer',
            },
            ...transactions,
          ],
        });
      },

      withdrawFromVault: (vaultId, amount) => {
        const { balance, vaults, transactions } = get();
        const vault = vaults.find((v) => v.id === vaultId);
        if (!vault || vault.saved < amount) throw new Error('Insufficient vault funds');
        const updated = vaults.map((v) =>
          v.id === vaultId ? { ...v, saved: v.saved - amount } : v
        );
        set({
          vaults: updated,
          balance: balance + amount,
          transactions: [
            {
              id: `t-${Date.now()}`,
              date: new Date().toISOString().split('T')[0],
              type: 'Credit',
              recipient: `Vault Withdrawal: ${vault.name}`,
              amount,
              category: 'Savings',
              status: 'Direct Transfer',
            },
            ...transactions,
          ],
        });
      },

      addTransaction: (t) =>
        set((s) => ({ transactions: [t, ...s.transactions] })),

      setOnboarding: (o) => set({ onboarding: o }),
      setMockMode: (v) => set({ isMockMode: v }),
      toggleDarkMode: () => set((s) => ({ isDarkMode: !s.isDarkMode })),
      setPersona: (p) => set({ persona: p }),
      setPendingTransfer: (pt) => set({ pendingTransfer: pt }),
      openIntercept: () => set({ isInterceptOpen: true }),
      closeIntercept: () => set({ isInterceptOpen: false }),

      executeAdjusted: () => {
        const { pendingTransfer, balance, transactions } = get();
        if (!pendingTransfer?.evalResult) return;
        const amt = pendingTransfer.evalResult.suggestedAmount;
        const savings = pendingTransfer.amount - amt;
        set({
          balance: balance - amt,
          isInterceptOpen: false,
          pendingTransfer: null,
          transactions: [
            {
              id: `t-${Date.now()}`,
              date: new Date().toISOString().split('T')[0],
              type: 'Debit',
              recipient: pendingTransfer.recipientName || pendingTransfer.recipientAddress,
              amount: amt,
              category: pendingTransfer.category,
              status: 'AI Adjusted',
            },
            ...transactions,
          ],
        });
        // Auto-save the remainder into first vault
        const { vaults } = get();
        if (vaults.length > 0 && savings > 0) {
          get().depositToVault(vaults[0].id, savings);
        }
      },

      executeFull: () => {
        const { pendingTransfer, balance, transactions } = get();
        if (!pendingTransfer) return;
        set({
          balance: balance - pendingTransfer.amount,
          isInterceptOpen: false,
          pendingTransfer: null,
          transactions: [
            {
              id: `t-${Date.now()}`,
              date: new Date().toISOString().split('T')[0],
              type: 'Debit',
              recipient: pendingTransfer.recipientName || pendingTransfer.recipientAddress,
              amount: pendingTransfer.amount,
              category: pendingTransfer.category,
              status: 'Direct Transfer',
            },
            ...transactions,
          ],
        });
      },

      cancelTransfer: () =>
        set({
          isInterceptOpen: false,
          pendingTransfer: null,
          transactions: [
            {
              id: `t-${Date.now()}`,
              date: new Date().toISOString().split('T')[0],
              type: 'Debit',
              recipient: get().pendingTransfer?.recipientName || 'Unknown',
              amount: get().pendingTransfer?.amount || 0,
              category: get().pendingTransfer?.category || 'General',
              status: 'Canceled',
            },
            ...get().transactions,
          ],
        }),
    }),
    {
      name: 'goalguard-store',
      partialize: (s) => ({
        balance: s.balance,
        vaults: s.vaults,
        transactions: s.transactions,
        onboarding: s.onboarding,
        isMockMode: s.isMockMode,
        isDarkMode: s.isDarkMode,
        persona: s.persona,
      }),
    }
  )
);
