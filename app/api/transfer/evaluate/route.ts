import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || 'unknown';

  const body = await req.json();
  const { recipientAddress, recipientName, amount, category } = body;

  const BMONI_API_BASE = process.env.BMONI_API_BASE || 'https://goalguard.onrender.com/api';

  try {
    const res = await fetch(
      `${BMONI_API_BASE}/transfer/evaluate?userId=${encodeURIComponent(userId)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientAddress, recipientName, amount, category }),
      }
    );

    if (res.ok) return NextResponse.json(await res.json());

    const fallback = `Sending ₦${amount.toLocaleString()} CNGN for ${category}. GoalGuard AI is evaluating this transaction.`;
    const suggestedAmount = Math.max(500, Math.round((amount * 0.48) / 100) * 100);

    return NextResponse.json({
      verdict: 'intercept',
      tradeOffExplanation: fallback,
      goalDelayDays: Math.max(1, Math.ceil(amount / 5000)),
      vaultImpact: { fromPercent: 65, toPercent: 30 },
      suggestedAmount,
      suggestedLabel: `Send ₦${suggestedAmount.toLocaleString()} CNGN Instead`,
    });
  } catch {
    return NextResponse.json({
      verdict: 'intercept',
      tradeOffExplanation: `Sending ₦${amount.toLocaleString()} CNGN for ${category}. AI evaluation unavailable — proceed with caution.`,
      goalDelayDays: 0,
      vaultImpact: { fromPercent: 65, toPercent: 65 },
      suggestedAmount: amount,
      suggestedLabel: `Send ₦${amount.toLocaleString()} CNGN Instead`,
    });
  }
}
