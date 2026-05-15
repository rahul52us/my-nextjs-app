import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const contentType = request.headers.get('content-type') || '';
    let hex: string;

    if (contentType.includes('application/json')) {
      const body = await request.json();
      hex = body.text ?? body.hex ?? '';
    } else {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const rawText = formData.get('text') as string | null;
      hex = rawText ? rawText.trim() : file ? (await file.text()).trim() : '';
    }

    if (!hex) return NextResponse.json({ error: 'Provide hex content via file or text field' }, { status: 400 });

    const cleaned = hex.replace(/\s+/g, '').replace(/^0x/i, '');
    if (!/^[0-9a-fA-F]*$/.test(cleaned)) {
      return NextResponse.json({ error: 'Invalid hex string' }, { status: 400 });
    }

    const base64 = Buffer.from(cleaned, 'hex').toString('base64');

    return new NextResponse(base64, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': 'attachment; filename="hex-encoded.txt"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to convert hex to base64' }, { status: 500 });
  }
}
