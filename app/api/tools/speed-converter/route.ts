import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { value, from, to } = body;

    if (value === undefined || !from || !to) {
      return NextResponse.json({ error: 'Provide value, from, and to speed units' }, { status: 400 });
    }

    const rates: Record<string, number> = {
      mps: 1,         // meters per second
      kmh: 0.277778,  // kilometers per hour
      mph: 0.44704,   // miles per hour
      knot: 0.514444  // knots
    };

    const val = parseFloat(value);
    const rateFrom = rates[from.toLowerCase()];
    const rateTo = rates[to.toLowerCase()];

    if (rateFrom && rateTo) {
      const result = (val * rateFrom) / rateTo;
      return NextResponse.json({ result });
    }

    return NextResponse.json({ error: 'Unsupported speed units' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
