import { NextRequest, NextResponse } from 'next/server';

// Accepts: file (text file containing base64) OR JSON { base64, mimeType, fileName }
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const contentType = request.headers.get('content-type') || '';
    let base64: string;
    let mimeType = 'application/octet-stream';
    let fileName = 'decoded-file.bin';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      base64 = body.base64 ?? '';
      mimeType = body.mimeType ?? mimeType;
      fileName = body.fileName ?? fileName;
    } else {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const rawText = formData.get('base64') as string | null;
      base64 = rawText ? rawText.trim() : file ? (await file.text()).trim() : '';
      mimeType = (formData.get('mimeType') as string) ?? mimeType;
      fileName = (formData.get('fileName') as string) ?? fileName;
    }

    if (!base64) return NextResponse.json({ error: 'Provide base64 string' }, { status: 400 });

    // Strip data URL prefix if present
    const match = base64.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      mimeType = match[1];
      base64 = match[2];
    }

    const buffer = Buffer.from(base64, 'base64');

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to decode base64 to file' }, { status: 500 });
  }
}
