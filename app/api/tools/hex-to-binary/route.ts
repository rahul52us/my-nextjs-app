import { NextRequest, NextResponse } from 'next/server';
import { getTextInput, hexToBinary } from '../binaryHelpers';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const hex = await getTextInput(request);
    if (!hex) {
      return NextResponse.json({ error: 'Provide hexadecimal text or a file containing hex data.' }, { status: 400 });
    }

    const output = hexToBinary(hex);
    return new NextResponse(output, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': 'attachment; filename="hex-to-binary.txt"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to convert hex to binary.' }, { status: 500 });
  }
}
