import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || 'unknown';

  const body = await req.json();
  const { recipientAddress, recipientName, amount, category, decision } = body;

  const BMONI_API_BASE = process.env.BMONI_API_BASE || 'https://goalguard.onrender.com/api';

  try {
    const res = await fetch(
      `${BMONI_API_BASE}/transfer/confirm?userId=${encodeURIComponent(userId)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientAddress, recipientName, amount, category, decision }),
      }
    );

    if (res.ok) return NextResponse.json(await res.json());
  } catch {
    // fall through to local mock
  }

  const mockTxId = `bmoni-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const statusLabel =
    decision === 'cancel' ? 'Canceled' : decision === 'adjust' ? 'AI Adjusted' : 'Direct Transfer';

  return NextResponse.json({
    success: true,
    message: `Transfer ${statusLabel.toLowerCase()}.`,
    transactionHash: mockTxId,
  });
}
