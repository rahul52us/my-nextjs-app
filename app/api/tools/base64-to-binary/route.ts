import { NextRequest, NextResponse } from 'next/server';
import { getTextInput, base64ToBinary } from '../binaryHelpers';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const base64 = await getTextInput(request);
    if (!base64) {
      return NextResponse.json({ error: 'Provide base64 text or a file containing base64 data.' }, { status: 400 });
    }

    const output = base64ToBinary(base64);
    if (!output) {
      return NextResponse.json({ error: 'Invalid Base64 input.' }, { status: 400 });
    }

    return new NextResponse(output, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': 'attachment; filename="base64-to-binary.txt"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to convert Base64 to binary.' }, { status: 500 });
  }
}
