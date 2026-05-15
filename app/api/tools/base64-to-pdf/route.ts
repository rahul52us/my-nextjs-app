import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const contentType = request.headers.get('content-type') || '';
    let base64: string;
    let fileName = 'document.pdf';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      base64 = body.base64 ?? body.text ?? '';
      fileName = body.fileName ?? fileName;
    } else {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const rawText = formData.get('base64') as string | null;
      base64 = rawText ? rawText.trim() : file ? (await file.text()).trim() : '';
      fileName = (formData.get('fileName') as string) ?? fileName;
    }

    if (!base64) return NextResponse.json({ error: 'Provide base64 PDF string' }, { status: 400 });

    const match = base64.match(/^data:application\/pdf;base64,(.+)$/);
    if (match) base64 = match[1];

    const buffer = Buffer.from(base64, 'base64');

    // Basic validation: PDF magic bytes
    if (buffer.slice(0, 4).toString() !== '%PDF') {
      return NextResponse.json({ error: 'Decoded content does not appear to be a valid PDF' }, { status: 400 });
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to decode PDF' }, { status: 500 });
  }
}
