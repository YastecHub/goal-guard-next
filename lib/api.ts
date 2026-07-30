// lib/api.ts — GoalGuard API layer (mock engine + live backend contract)
import { EvalResult, OnboardingState, Persona, Vault } from './store';

const API_BASE = 'http://localhost:5239/api';
const USER_ID_STORAGE_KEY = 'goalguard.userId';
const BMONI_USER_ID_STORAGE_KEY = 'goalguard.bmoniUserId';

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

interface OnboardingUserPayload {
  firstName: string;
  email: string;
  phoneNumber: string;
}

interface OnboardingUserResponse {
  userId: string;
  bmoniUserId: string;
  status: string;
}

interface WalletChallengeResponse {
  walletAddress?: string;
  smartWalletAddress?: string;
  userOwnerAddress?: string;
  status?: string;
  [key: string]: unknown;
}

interface WalletResponse {
  walletAddress?: string;
  smartWalletAddress?: string;
  userOwnerAddress?: string;
  status?: string;
  [key: string]: unknown;
}

type OnboardingStepPayload = Partial<OnboardingUserPayload> & Record<string, unknown>;

function persistOnboardingIdentity(response: OnboardingUserResponse) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(USER_ID_STORAGE_KEY, response.userId);
  window.localStorage.setItem(BMONI_USER_ID_STORAGE_KEY, response.bmoniUserId);
}

function getStoredUserId() {
  if (typeof window === 'undefined') return '';

  return window.localStorage.getItem(USER_ID_STORAGE_KEY) || '';
}

async function getApiErrorMessage(res: Response, fallback: string) {
  try {
    const body = await res.json();
    return body?.error || body?.message || fallback;
  } catch {
    return fallback;
  }
}

// ─── BMONI Onboarding ─────────────────────────────────────────────────────────

export async function runOnboardingStep(
  stepNumber: number,
  isMockMode: boolean,
  payload?: OnboardingStepPayload
): Promise<Partial<OnboardingState>> {
  if (stepNumber === 1) {
    const res = await fetch(`${API_BASE}/onboarding/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await getApiErrorMessage(res, 'User creation failed'));

    const data = (await res.json()) as OnboardingUserResponse;
    persistOnboardingIdentity(data);

    return {
      userId: data.userId,
      bmoniUserId: data.bmoniUserId,
      currentStep: 1,
      generalStatus: 'In Progress',
    };
  }

  if (stepNumber === 2) {
    const userId = getStoredUserId();
    if (!userId) throw new Error('User ID is missing. Please create the user profile first.');

    // 1. Call wallet-challenge
    const resChallenge = await fetch(`${API_BASE}/onboarding/${userId}/wallet-challenge`, {
      method: 'POST',
    });
    if (!resChallenge.ok) throw new Error(await getApiErrorMessage(resChallenge, 'Wallet challenge failed'));

    const challengeData = (await resChallenge.json()) as WalletChallengeResponse;

    // 2. Automatically call wallet next upon success of wallet-challenge
    const resWallet = await fetch(`${API_BASE}/onboarding/${userId}/wallet`, {
      method: 'POST',
    });
    if (!resWallet.ok) throw new Error(await getApiErrorMessage(resWallet, 'Wallet creation failed'));

    const walletData = (await resWallet.json()) as WalletResponse;

    const walletAddress =
      walletData.walletAddress ||
      walletData.smartWalletAddress ||
      walletData.userOwnerAddress ||
      challengeData.walletAddress ||
      challengeData.smartWalletAddress ||
      challengeData.userOwnerAddress;

    return {
      walletAddress,
      currentStep: 2,
    };
  }

  if (stepNumber === 4) {
    if (isMockMode) {
      await new Promise((r) => setTimeout(r, 600));
      return { railActive: true, currentStep: 4, generalStatus: 'Onboarded' };
    }

    const userId = getStoredUserId();
    if (!userId) throw new Error('User ID is missing. Please create the user profile first.');

    const res = await fetch(`${API_BASE}/v1/users/${encodeURIComponent(userId)}/onboarding/start-nigeria`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(await getApiErrorMessage(res, 'NGN Rail onboarding failed'));

    const data = await res.json();
    return {
      ...data,
      railActive: true,
      currentStep: 4,
      generalStatus: 'Onboarded',
    };
  }

  if (isMockMode) {
    await new Promise((r) => setTimeout(r, 600));
    if (stepNumber === 3) return { kycVerified: true, currentStep: 3 };
  }

  const res = await fetch(`${API_BASE}/onboarding/setup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ step: stepNumber, ...payload }),
  });
  if (!res.ok) throw new Error(`Onboarding step ${stepNumber} failed`);
  return res.json();
}
