import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { value, from, to } = body;

    if (value === undefined || !from || !to) {
      return NextResponse.json({ error: 'Provide value, from, and to time units' }, { status: 400 });
    }

    const rates: Record<string, number> = {
      ms: 0.001,
      s: 1,
      min: 60,
      hr: 3600,
      day: 86400,
      week: 604800,
      month: 2592000,
      year: 31536000
    };

    const val = parseFloat(value);
    const rateFrom = rates[from.toLowerCase()];
    const rateTo = rates[to.toLowerCase()];

    if (rateFrom && rateTo) {
      const result = (val * rateFrom) / rateTo;
      return NextResponse.json({ result });
    }

    return NextResponse.json({ error: 'Unsupported time units' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
