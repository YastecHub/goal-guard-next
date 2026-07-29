import { NextRequest, NextResponse } from 'next/server';

// POST /api/transfer/execute
// In production: forward to BMONI sandbox rails using BMONI_API_KEY env var
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { recipientAddress, amount, choice } = body;

  if (choice === 'cancel') {
    return NextResponse.json({ success: true, txId: null, status: 'Canceled' });
  }

  // Simulate BMONI SDK call — in production this would call:
  // POST https://embedded-dev.bmoni.com/v1/users/{userId}/smart-wallets/transfer
  // with x-api-key: process.env.BMONI_API_KEY
  const mockTxId = `bmoni-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return NextResponse.json({
    success: true,
    txId: mockTxId,
    status: choice === 'adjusted' ? 'AI Adjusted' : 'Direct Transfer',
    amount,
    recipient: recipientAddress,
  });
}
