// lib/api.ts — GoalGuard API layer (mock engine + live backend contract)
import { EvalResult, OnboardingState, Persona, Vault } from './store';

const API_BASE = '/api';

// ─── Mock Helpers ─────────────────────────────────────────────────────────────

function buildPersonas(
  amount: number,
  category: string,
  vaultName: string,
  delayDays: number,
  suggested: number
): Record<Persona, string> {
  return {
    english: `Sending ₦${amount.toLocaleString()} CNGN for ${category} now will delay your '${vaultName}' target by ${delayDays} days. If you send ₦${suggested.toLocaleString()} CNGN instead, you stay on track for your target date!`,
    pidgin: `Oga/Madam, if you send ₦${amount.toLocaleString()} CNGN for ${category} right now, your '${vaultName}' goal go shift back by ${delayDays} days o! Make you send ₦${suggested.toLocaleString()} CNGN instead — your money go stay safe.`,
    genz: `Bestie 😬 sending ₦${amount.toLocaleString()} CNGN is giving ${delayDays} days delay on your '${vaultName}' goal. Send ₦${suggested.toLocaleString()} CNGN instead and keep the bag secured fr.`,
    merchant: `Paying ₦${amount.toLocaleString()} CNGN from operating capital delays your '${vaultName}' milestone by ${delayDays} days. Re-allocating to ₦${suggested.toLocaleString()} CNGN preserves your liquidity position.`,
  };
}

// ─── Evaluate Transfer ────────────────────────────────────────────────────────

export interface EvaluatePayload {
  amount: number;
  category: string;
  recipientAddress: string;
  recipientName: string;
  vaults: Vault[];
  persona: Persona;
  isMockMode: boolean;
}

export async function handleEvaluateTransfer(payload: EvaluatePayload): Promise<EvalResult> {
  if (payload.isMockMode) {
    await new Promise((r) => setTimeout(r, 800)); // simulate AI latency

    const activeVault = payload.vaults.find((v) => v.saved < v.target);
    if (!activeVault) {
      return {
        intercepted: false,
        tradeOffText: '',
        suggestedAmount: payload.amount,
        delayDays: 0,
        personas: buildPersonas(payload.amount, payload.category, 'Vault', 0, payload.amount),
      };
    }

    const remaining = activeVault.target - activeVault.saved;
    const dailyRate = Math.ceil(remaining / activeVault.days);
    const delayDays = Math.max(1, Math.ceil(payload.amount / (dailyRate || 1000)));
    const suggested = Math.max(500, Math.round((payload.amount * 0.48) / 100) * 100);
    const personas = buildPersonas(payload.amount, payload.category, activeVault.name, delayDays, suggested);

    return {
      intercepted: true,
      tradeOffText: personas[payload.persona],
      suggestedAmount: suggested,
      delayDays,
      personas,
    };
  }

  const res = await fetch(`${API_BASE}/transfer/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Evaluation failed');
  return res.json();
}

// ─── Execute Transfer ─────────────────────────────────────────────────────────

export interface ExecutePayload {
  recipientAddress: string;
  recipientName: string;
  amount: number;
  category: string;
  choice: 'adjusted' | 'full' | 'cancel';
  isMockMode: boolean;
}

export async function handleExecuteTransfer(payload: ExecutePayload): Promise<{ success: boolean; txId: string }> {
  if (payload.isMockMode) {
    await new Promise((r) => setTimeout(r, 400));
    return { success: true, txId: `mock-tx-${Date.now()}` };
  }
  const res = await fetch(`${API_BASE}/transfer/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Transfer execution failed');
  return res.json();
}

// ─── BMONI Onboarding ─────────────────────────────────────────────────────────

export async function runOnboardingStep(
  stepNumber: number,
  isMockMode: boolean,
  payload?: Record<string, any>
): Promise<Partial<OnboardingState>> {
  if (isMockMode) {
    await new Promise((r) => setTimeout(r, 600));
    if (stepNumber === 1)
      return { userId: 'usr_' + Math.random().toString(36).slice(2, 11), currentStep: 1, generalStatus: 'In Progress' };
    if (stepNumber === 2)
      return {
        walletAddress: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        currentStep: 2,
      };
    if (stepNumber === 3) return { kycVerified: true, currentStep: 3 };
    if (stepNumber === 4) return { railActive: true, currentStep: 4, generalStatus: 'Onboarded' };
  }
  const res = await fetch(`${API_BASE}/onboarding/setup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ step: stepNumber, ...payload }),
  });
  if (!res.ok) throw new Error(`Onboarding step ${stepNumber} failed`);
  return res.json();
}
