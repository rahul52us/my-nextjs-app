import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString('base64');
    const mimeType = file.type || 'application/octet-stream';
    const dataUri = `data:${mimeType};base64,${base64}`;

    return new NextResponse(dataUri, {
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
    });
  } catch (error) {
    console.error('File to Base64 conversion error:', error);
    return NextResponse.json({ error: 'Failed to convert file to Base64' }, { status: 500 });
  }
}
