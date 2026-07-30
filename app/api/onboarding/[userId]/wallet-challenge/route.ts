import { NextRequest, NextResponse } from 'next/server';

const BMONI_API_BASE = process.env.BMONI_API_BASE || 'http://localhost:5239/api';

async function readBackendError(res: Response) {
  const fallback = `BMONI wallet challenge failed with status ${res.status}`;

  try {
    const body = await res.json();
    return body?.message || body?.error || fallback;
  } catch {
    return fallback;
  }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  let res: Response;

  try {
    res = await fetch(
      `${BMONI_API_BASE}/onboarding/${encodeURIComponent(userId)}/wallet-challenge`,
      {
        method: 'POST',
        cache: 'no-store',
      }
    );
  } catch {
    return NextResponse.json(
      { error: `Unable to reach BMONI backend at ${BMONI_API_BASE}` },
      { status: 502 }
    );
  }

  if (!res.ok) {
    return NextResponse.json(
      { error: await readBackendError(res) },
      { status: res.status }
    );
  }

  return NextResponse.json(await res.json());
}
