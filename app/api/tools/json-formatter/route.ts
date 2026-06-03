import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    let jsonInput: any;
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      jsonInput = body.data ?? body.text ?? body;
    } else {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const text = formData.get('text') as string | null;

      if (text) {
        jsonInput = JSON.parse(text);
      } else if (file) {
        jsonInput = JSON.parse(await file.text());
      } else {
        return NextResponse.json({ error: 'Provide text or file field' }, { status: 400 });
      }
    }

    const formatted = JSON.stringify(jsonInput, null, 2);

    return new NextResponse(formatted, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="formatted.json"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Invalid JSON data: ' + error.message }, { status: 400 });
  }
}
