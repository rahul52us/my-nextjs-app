import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const contentType = request.headers.get('content-type') || '';
    let base64: string;

    if (contentType.includes('application/json')) {
      const body = await request.json();
      base64 = body.text ?? body.base64 ?? '';
    } else {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const rawText = formData.get('text') as string | null;
      if (rawText) {
        base64 = rawText.trim();
      } else if (file) {
        base64 = (await file.text()).trim();
      } else {
        return NextResponse.json({ error: 'Provide a file or text field with Base64 content' }, { status: 400 });
      }
    }

    const decoded = Buffer.from(base64, 'base64').toString('utf-8');

    return new NextResponse(decoded, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': 'attachment; filename="decoded.txt"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to decode' }, { status: 500 });
  }
}
