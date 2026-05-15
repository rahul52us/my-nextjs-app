import { NextRequest, NextResponse } from 'next/server';

// Accepts: file (text file) OR JSON body { text: string }
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const contentType = request.headers.get('content-type') || '';

    let text: string;

    if (contentType.includes('application/json')) {
      const body = await request.json();
      text = body.text ?? '';
    } else {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const rawText = formData.get('text') as string | null;
      if (rawText) {
        text = rawText;
      } else if (file) {
        text = await file.text();
      } else {
        return NextResponse.json({ error: 'Provide a file or text field' }, { status: 400 });
      }
    }

    const base64 = Buffer.from(text, 'utf-8').toString('base64');

    return new NextResponse(base64, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': 'attachment; filename="encoded.txt"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to encode' }, { status: 500 });
  }
}
