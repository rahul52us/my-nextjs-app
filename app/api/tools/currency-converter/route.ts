import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { value, from, to } = body;

    if (value === undefined || !from || !to) {
      return NextResponse.json({ error: 'Provide value, from, and to currency ISO codes' }, { status: 400 });
    }

    // Mock exchange rates (USD base)
    const rates: Record<string, number> = {
      usd: 1.0,
      eur: 0.92,
      gbp: 0.78,
      inr: 83.5,
      jpy: 156.2,
      cad: 1.36,
      aud: 1.51
    };

    const val = parseFloat(value);
    const rateFrom = rates[from.toLowerCase()];
    const rateTo = rates[to.toLowerCase()];

    if (rateFrom && rateTo) {
      const result = (val / rateFrom) * rateTo;
      return NextResponse.json({ result });
    }

    return NextResponse.json({ error: 'Unsupported currencies' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
