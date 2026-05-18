import { NextRequest, NextResponse } from 'next/server';
import { getTextInput, binaryToFile } from '../binaryHelpers';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const binary = await getTextInput(request);
    if (!binary) {
      return NextResponse.json({ error: 'Provide binary text or a file containing binary data.' }, { status: 400 });
    }

    const output = binaryToFile(binary);
    return new NextResponse(output, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="binary-to-file.bin"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to convert binary to file.' }, { status: 500 });
  }
}
