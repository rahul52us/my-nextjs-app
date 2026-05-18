import { NextRequest, NextResponse } from 'next/server';
import { getTextInput, textToBinary } from '../binaryHelpers';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const text = await getTextInput(request);
    if (!text) {
      return NextResponse.json({ error: 'Provide text or a file containing text.' }, { status: 400 });
    }

    const output = textToBinary(text);
    return new NextResponse(output, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': 'attachment; filename="text-to-binary.txt"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to convert text to binary.' }, { status: 500 });
  }
}
