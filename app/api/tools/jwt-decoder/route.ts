import { NextRequest, NextResponse } from 'next/server';

function base64UrlDecode(str: string): string {
  // Pad base64url string
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4;
  const padded2 = pad ? padded + '='.repeat(4 - pad) : padded;
  return Buffer.from(padded2, 'base64').toString('utf-8');
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const contentType = request.headers.get('content-type') || '';
    let token: string;

    if (contentType.includes('application/json')) {
      const body = await request.json();
      token = body.token ?? body.text ?? '';
    } else {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const rawText = formData.get('token') as string | null;
      token = rawText ? rawText.trim() : file ? (await file.text()).trim() : '';
    }

    if (!token) return NextResponse.json({ error: 'Provide a JWT token' }, { status: 400 });

    const parts = token.split('.');
    if (parts.length !== 3) {
      return NextResponse.json({ error: 'Invalid JWT: must have 3 parts (header.payload.signature)' }, { status: 400 });
    }

    let header: object, payload: object;
    try {
      header = JSON.parse(base64UrlDecode(parts[0]));
      payload = JSON.parse(base64UrlDecode(parts[1]));
    } catch {
      return NextResponse.json({ error: 'Failed to decode JWT parts. Ensure the token is valid.' }, { status: 400 });
    }

    const signature = parts[2];

    // Check expiry
    const payloadAny = payload as any;
    const isExpired = payloadAny.exp ? Date.now() / 1000 > payloadAny.exp : null;

    return NextResponse.json({
      success: true,
      header,
      payload,
      signature,
      isExpired,
      issuedAt: payloadAny.iat ? new Date(payloadAny.iat * 1000).toISOString() : null,
      expiresAt: payloadAny.exp ? new Date(payloadAny.exp * 1000).toISOString() : null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to decode JWT' }, { status: 500 });
  }
}
