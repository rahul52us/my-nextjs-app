import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = request.headers.get('content-type')?.includes('application/json') ? await request.json() : null;
    return NextResponse.json({ success: true, received: body || 'ok' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Regextool failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ success: true, message: 'Regextool stub' });
}
