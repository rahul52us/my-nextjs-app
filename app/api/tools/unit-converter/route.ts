import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { value, from, to } = body;

    if (value === undefined || !from || !to) {
      return NextResponse.json({ error: 'Provide value, from, and to fields' }, { status: 400 });
    }

    // Length conversion helper
    const rates: Record<string, number> = {
      m: 1,
      km: 1000,
      cm: 0.01,
      mm: 0.001,
      inch: 0.0254,
      foot: 0.3048,
      yard: 0.9144,
      mile: 1609.34
    };

    const val = parseFloat(value);
    const rateFrom = rates[from.toLowerCase()];
    const rateTo = rates[to.toLowerCase()];

    if (rateFrom && rateTo) {
      const result = (val * rateFrom) / rateTo;
      return NextResponse.json({ result });
    }

    return NextResponse.json({ error: 'Unsupported units' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
