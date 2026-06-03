import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { value, fromBase, toBase } = body;

    if (value === undefined || !fromBase || !toBase) {
      return NextResponse.json({ error: 'Provide value, fromBase, and toBase fields' }, { status: 400 });
    }

    const decimalValue = parseInt(value.toString(), parseInt(fromBase));
    if (isNaN(decimalValue)) {
      return NextResponse.json({ error: 'Invalid input number for base ' + fromBase }, { status: 400 });
    }

    const result = decimalValue.toString(parseInt(toBase)).toUpperCase();
    return NextResponse.json({ result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
