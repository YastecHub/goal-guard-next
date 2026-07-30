import { NextRequest, NextResponse } from 'next/server';

const BMONI_API_BASE = process.env.BMONI_API_BASE || 'https://goalguard.onrender.com/api';

async function readBackendError(res: Response) {
  const fallback = `BMONI Rail onboarding failed with status ${res.status}`;

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

  const targetUrl = `${BMONI_API_BASE}/v1/users/${encodeURIComponent(userId)}/onboarding/start-nigeria`;
  const fallbackUrl = BMONI_API_BASE.endsWith('/api')
    ? `${BMONI_API_BASE.replace(/\/api$/, '')}/v1/users/${encodeURIComponent(userId)}/onboarding/start-nigeria`
    : targetUrl;

  try {
    res = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (res.status === 404 && targetUrl !== fallbackUrl) {
      res = await fetch(fallbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });
    }
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
