import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { value, action } = body; // action: 'to_date' or 'to_timestamp'

    if (!value) {
      return NextResponse.json({ error: 'Provide value field' }, { status: 400 });
    }

    if (action === 'to_date') {
      const timestamp = parseInt(value.toString());
      // Check if timestamp is in seconds or milliseconds
      const date = new Date(timestamp < 99999999999 ? timestamp * 1000 : timestamp);
      return NextResponse.json({ result: date.toUTCString(), local: date.toString() });
    } else {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return NextResponse.json({ error: 'Invalid date string' }, { status: 400 });
      }
      return NextResponse.json({ result: Math.floor(date.getTime() / 1000) });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
