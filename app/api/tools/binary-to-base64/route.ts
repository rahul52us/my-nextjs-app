import { NextRequest, NextResponse } from 'next/server';
import { getTextInput, binaryToBase64 } from '../binaryHelpers';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const binary = await getTextInput(request);
    if (!binary) {
      return NextResponse.json({ error: 'Provide binary text or a file containing binary data.' }, { status: 400 });
    }

    const output = binaryToBase64(binary);
    return new NextResponse(output, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': 'attachment; filename="binary-to-base64.txt"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to convert binary to Base64.' }, { status: 500 });
  }
}
