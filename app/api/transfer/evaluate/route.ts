import { NextRequest, NextResponse } from 'next/server';

// POST /api/transfer/evaluate
// Backend contract for live mode: receives transfer details, returns AI evaluation
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { amount, category, vaults, persona } = body;

  const activeVault = vaults?.find((v: any) => v.saved < v.target);
  if (!activeVault) {
    return NextResponse.json({
      intercepted: false,
      tradeOffText: '',
      suggestedAmount: amount,
      delayDays: 0,
      personas: {},
    });
  }

  const remaining = activeVault.target - activeVault.saved;
  const dailyRate = Math.ceil(remaining / activeVault.days);
  const delayDays = Math.max(1, Math.ceil(amount / (dailyRate || 1000)));
  const suggested = Math.max(500, Math.round((amount * 0.48) / 100) * 100);

  const personas = {
    english: `Sending ₦${amount.toLocaleString()} CNGN for ${category} now will delay your '${activeVault.name}' target by ${delayDays} days. If you send ₦${suggested.toLocaleString()} CNGN instead, you stay on track!`,
    pidgin: `Oga, if you send ₦${amount.toLocaleString()} CNGN for ${category} right now, your '${activeVault.name}' goal go shift back by ${delayDays} days o! Make you send ₦${suggested.toLocaleString()} CNGN instead.`,
    genz: `Bestie 😬 sending ₦${amount.toLocaleString()} CNGN is giving ${delayDays} days delay on your '${activeVault.name}' goal. Send ₦${suggested.toLocaleString()} CNGN instead fr.`,
    merchant: `Paying ₦${amount.toLocaleString()} CNGN delays your '${activeVault.name}' milestone by ${delayDays} days. Re-allocating to ₦${suggested.toLocaleString()} CNGN protects your liquidity.`,
  };

  return NextResponse.json({
    intercepted: true,
    tradeOffText: personas[persona as keyof typeof personas] || personas.english,
    suggestedAmount: suggested,
    delayDays,
    personas,
  });
}
