'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { runOnboardingStep } from '@/lib/api';
import {
  X, CheckCircle2, Loader2, Wallet, ArrowRight, Sparkles, Check, ChevronLeft, Shield
} from 'lucide-react';

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

export default function OnboardingModal() {
  const router = useRouter();
  const {
    isOnboardingModalOpen,
    closeOnboardingModal,
    onboarding,
    setOnboarding,
    isMockMode,
    addTransaction,
    setBalance,
    balance,
  } = useStore();

  const [wizardStep, setWizardStep] = useState(1); // 1 to 5
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1 Form
  const [firstName, setFirstName] = useState('Test123456');
  const [email, setEmail] = useState('yasir@goalguard.io');
  const [phoneNumber, setPhoneNumber] = useState('+234312364728');

  // Step 3 Form
  const [bvn, setBvn] = useState('22222222222');

  if (!isOnboardingModalOpen) return null;

  // Handle Step 1: Create Account
  const handleStep1 = async () => {
    if (!firstName || !email || !phoneNumber) {
      setError('Please fill in your first name, email, and phone number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const patch = await runOnboardingStep(1, isMockMode, { firstName, email, phoneNumber });
      setOnboarding({ ...onboarding, ...patch } as typeof onboarding);
      setWizardStep(2);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Account creation failed'));
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2: Deploy Smart Wallet
  const handleStep2 = async () => {
    setError('');
    setLoading(true);
    try {
      const patch = await runOnboardingStep(2, isMockMode);
      setOnboarding({ ...onboarding, ...patch } as typeof onboarding);
      setWizardStep(3);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Smart Wallet deployment failed'));
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 3: Identity & KYC
  const handleStep3 = async () => {
    if (bvn.length < 11) {
      setError('Please enter a valid 11-digit BVN');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const patch = await runOnboardingStep(3, isMockMode, { bvn });
      setOnboarding({ ...onboarding, ...patch } as typeof onboarding);
      setWizardStep(4);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'KYC verification failed'));
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 4: Activate NGN Rail & Fund
  const handleStep4 = async () => {
    setError('');
    setLoading(true);
    try {
      const patch = await runOnboardingStep(4, isMockMode);
      setOnboarding({ ...onboarding, ...patch } as typeof onboarding);
      setBalance(balance + 1000);
      addTransaction({
        id: `t-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: 'Credit',
        recipient: 'BMONI CNGN Sandbox Credit',
        amount: 1000,
        category: 'Test Funds',
        status: 'Direct Transfer',
      });
      setWizardStep(5);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'NGN Rail activation failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    closeOnboardingModal();
    router.push('/dashboard');
  };

  const pct = Math.min(100, (wizardStep / 4) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
        onClick={closeOnboardingModal}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Gradient Progress Line */}
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
            style={{ width: wizardStep === 5 ? '100%' : `${pct}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-2">
            {wizardStep > 1 && wizardStep < 5 && (
              <button
                onClick={() => setWizardStep((s) => s - 1)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center">
              <Sparkles size={16} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                BMONI Onboarding
              </p>
              <p className="text-slate-900 dark:text-white font-extrabold text-base leading-tight">
                {wizardStep === 1 && 'Create BMONI Profile'}
                {wizardStep === 2 && 'Deploy Smart Wallet'}
                {wizardStep === 3 && 'Identity & KYC Verification'}
                {wizardStep === 4 && 'Activate CNGN Stablecoin Rail'}
                {wizardStep === 5 && 'Setup Complete!'}
              </p>
            </div>
          </div>

          <button
            onClick={closeOnboardingModal}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step Indicator Badges */}
        <div className="px-6 py-2 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1 text-[11px] font-bold">
          {[
            { n: 1, label: 'Profile' },
            { n: 2, label: 'Wallet' },
            { n: 3, label: 'KYC' },
            { n: 4, label: 'Rail' },
          ].map((s) => {
            const active = wizardStep === s.n;
            const completed = wizardStep > s.n || wizardStep === 5;

            return (
              <div
                key={s.n}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg transition-all ${
                  completed
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold'
                    : active
                    ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white font-extrabold ring-1 ring-emerald-500/30'
                    : 'text-slate-400 dark:text-slate-600'
                }`}
              >
                {completed ? <Check size={12} strokeWidth={3} /> : <span>{s.n}.</span>}
                <span>{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800 rounded-xl">
              {error}
            </div>
          )}

          {/* STEP 1: Profile Creation */}
          {wizardStep === 1 && (
            <div className="space-y-4">
              <p className="text-slate-600 dark:text-slate-300 text-xs font-medium leading-relaxed">
                Set up your BMONI identity profile to unlock intelligent CNGN stablecoin transfers with real-time GoalGuard AI protection.
              </p>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 text-xs font-bold mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Tunde"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 text-xs font-bold mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. user@example.com"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 text-xs font-bold mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. +234312364728"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-medium"
                />
              </div>

              <button
                onClick={handleStep1}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-5 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98] text-sm mt-2"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Creating Profile...</>
                ) : (
                  <>Create Profile & Continue <ArrowRight size={16} /></>
                )}
              </button>
            </div>
          )}

          {/* STEP 2: Deploy Smart Wallet */}
          {wizardStep === 2 && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/90 rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <Wallet size={18} className="text-emerald-600 dark:text-emerald-400" />
                  <p className="text-slate-900 dark:text-white text-xs font-bold">Smart Contract Account Abstraction</p>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed font-medium">
                  BMONI provisions a managed smart wallet contract for instant settlement, automated savings locks, and gasless transaction handling.
                </p>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 text-xs font-bold mb-1.5">
                  Currency
                </label>
                <input
                  type="text"
                  value="CNGN"
                  disabled
                  className="w-full bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-500 dark:text-slate-400 outline-none font-bold cursor-not-allowed"
                />
              </div>

              {onboarding.walletAddress && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                  <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 mb-1">
                    Generated Wallet Address:
                  </p>
                  <code className="text-xs font-mono text-emerald-900 dark:text-emerald-300 font-bold break-all">
                    {onboarding.walletAddress}
                  </code>
                </div>
              )}

              <button
                onClick={handleStep2}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-5 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98] text-sm"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Deploying Contract...</>
                ) : (
                  <>Deploy Smart Wallet Contract <ArrowRight size={16} /></>
                )}
              </button>
            </div>
          )}

          {/* STEP 3: Identity Verification (KYC) */}
          {wizardStep === 3 && (
            <div className="space-y-4">
              <p className="text-slate-600 dark:text-slate-300 text-xs font-medium leading-relaxed">
                Provide your 11-digit Bank Verification Number (BVN) to verify your account tier and enable NGN fiat settlement rails.
              </p>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 text-xs font-bold mb-1.5">
                  11-Digit BVN Number
                </label>
                <input
                  type="text"
                  maxLength={11}
                  value={bvn}
                  onChange={(e) => setBvn(e.target.value)}
                  placeholder="22222222222"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-mono text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 font-bold"
                />
              </div>

              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                <Shield size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <p className="text-[11px] font-medium">
                  Encrypted end-to-end. NIMC identity check enabled for sandbox testing.
                </p>
              </div>

              <button
                onClick={handleStep3}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-5 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98] text-sm"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Verifying Identity...</>
                ) : (
                  <>Verify Identity & Continue <ArrowRight size={16} /></>
                )}
              </button>
            </div>
          )}

          {/* STEP 4: Activate NGN Rail & Fund */}
          {wizardStep === 4 && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-emerald-600 dark:text-emerald-400" />
                  <p className="text-slate-900 dark:text-white text-xs font-bold">Connect NGN Fiat Bridge</p>
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed font-medium">
                  Connecting your account to the NGN Rail stablecoin bridge. Step 4 auto-allocates ₦1,000 CNGN test funds to your active balance.
                </p>
              </div>

              <button
                onClick={handleStep4}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-5 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98] text-sm"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Connecting Rail...</>
                ) : (
                  <>Activate Rail & Fund ₦1,000 CNGN 🎉</>
                )}
              </button>
            </div>
          )}

          {/* STEP 5: Success Celebration */}
          {wizardStep === 5 && (
            <div className="text-center space-y-5 py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 size={36} className="text-emerald-600 dark:text-emerald-400" />
              </div>

              <div>
                <h3 className="text-slate-900 dark:text-white font-extrabold text-xl">
                  🎉 Onboarding Complete!
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-1">
                  Your BMONI Smart Wallet is live & protected by GoalGuard AI.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">User ID:</span>
                  <span className="text-slate-900 dark:text-white font-mono font-bold">{onboarding.userId || 'usr_sandbox'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">BMONI User ID:</span>
                  <span className="text-slate-900 dark:text-white font-mono font-bold truncate max-w-[200px]">
                    {onboarding.bmoniUserId || 'bmoni_sandbox'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Wallet Address:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold truncate max-w-[200px]">
                    {onboarding.walletAddress || '0x...'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">KYC Status:</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">✓ Verified</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">NGN Rail:</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">✓ Active (Testnet)</span>
                </div>
              </div>

              <button
                onClick={handleFinish}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-5 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-[0.98] text-sm"
              >
                Go to Dashboard 🚀
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
