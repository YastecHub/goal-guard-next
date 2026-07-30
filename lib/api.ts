// lib/api.ts — GoalGuard API layer (backend contract)
import { OnboardingState } from './store';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '/api';
const USER_ID_STORAGE_KEY = 'goalguard.userId';
const BMONI_USER_ID_STORAGE_KEY = 'goalguard.bmoniUserId';

// ─── Evaluate Transfer ────────────────────────────────────────────────────────

export async function evaluateTransfer(
  userId: string,
  payload: { recipientAddress: string; recipientName: string; amount: number; category: string }
): Promise<{
  verdict: 'allow' | 'intercept' | 'block';
  tradeOffExplanation: string;
  goalDelayDays: number;
  vaultImpact: { fromPercent: number; toPercent: number };
  suggestedAmount: number;
  suggestedLabel: string;
}> {
  const res = await fetch(`${API_BASE}/transfer/evaluate?userId=${encodeURIComponent(userId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await getApiErrorMessage(res, 'Evaluation failed'));
  return res.json();
}

// ─── Confirm Transfer ─────────────────────────────────────────────────────────

export async function confirmTransfer(
  userId: string,
  payload: {
    recipientAddress: string;
    recipientName: string;
    amount: number;
    category: string;
    decision: 'proceed' | 'adjust' | 'cancel';
  }
): Promise<{ success: boolean; message: string; transactionHash: string }> {
  const res = await fetch(`${API_BASE}/transfer/confirm?userId=${encodeURIComponent(userId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await getApiErrorMessage(res, 'Transfer confirmation failed'));
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
