import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    let text = '';
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      text = body.text ?? '';
    } else {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const textVal = formData.get('text') as string | null;

      if (textVal) {
        text = textVal;
      } else if (file) {
        text = await file.text();
      } else {
        return NextResponse.json({ error: 'No text or file provided' }, { status: 400 });
      }
    }

    // Clean text: trim whitespace, normalize line endings, remove double spaces
    const cleaned = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');

    return new NextResponse(cleaned, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
        'Content-Disposition': 'attachment; filename="formatted.txt"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to format text' }, { status: 500 });
  }
}
