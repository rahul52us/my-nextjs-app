import { NextRequest, NextResponse } from 'next/server';
import { getTextInput, textToBinary } from '../binaryHelpers';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const ascii = await getTextInput(request);
    if (!ascii) {
      return NextResponse.json({ error: 'Provide ASCII text or a file containing ASCII text.' }, { status: 400 });
    }

    const output = textToBinary(ascii);
    return new NextResponse(output, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': 'attachment; filename="ascii-to-binary.txt"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to convert ASCII to binary.' }, { status: 500 });
  }
}
