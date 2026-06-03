import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { value, from, to } = body;

    if (value === undefined || !from || !to) {
      return NextResponse.json({ error: 'Provide value, from, and to data size units' }, { status: 400 });
    }

    const rates: Record<string, number> = {
      b: 1,
      kb: 1024,
      mb: 1024 * 1024,
      gb: 1024 * 1024 * 1024,
      tb: 1024 * 1024 * 1024 * 1024,
      pb: 1024 * 1024 * 1024 * 1024 * 1024
    };

    const val = parseFloat(value);
    const rateFrom = rates[from.toLowerCase()];
    const rateTo = rates[to.toLowerCase()];

    if (rateFrom && rateTo) {
      const result = (val * rateFrom) / rateTo;
      return NextResponse.json({ result });
    }

    return NextResponse.json({ error: 'Unsupported data size units' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
