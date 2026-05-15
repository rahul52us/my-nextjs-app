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
      base64 = rawText ? rawText.trim() : file ? (await file.text()).trim() : '';
    }

    if (!base64) return NextResponse.json({ error: 'Provide base64 content via file or text field' }, { status: 400 });

    const hex = Buffer.from(base64, 'base64').toString('hex');

    return new NextResponse(hex, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': 'attachment; filename="decoded.hex"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to convert base64 to hex' }, { status: 500 });
  }
}
