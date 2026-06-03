import { NextRequest, NextResponse } from 'next/server';
import beautify from 'js-beautify';

export async function POST(request: NextRequest) {
  try {
    let code = '';
    let language = 'js';
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      code = body.code ?? body.text ?? '';
      language = body.language ?? 'js';
    } else {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const textVal = formData.get('text') as string | null;
      language = (formData.get('language') as string) || 'js';

      if (textVal) {
        code = textVal;
      } else if (file) {
        code = await file.text();
      } else {
        return NextResponse.json({ error: 'No code text or file provided' }, { status: 400 });
      }
    }

    let formatted = code;
    if (language === 'html') {
      formatted = beautify.html(code, { indent_size: 2 });
    } else if (language === 'css') {
      formatted = beautify.css(code, { indent_size: 2 });
    } else {
      formatted = beautify.js(code, { indent_size: 2 });
    }

    return new NextResponse(formatted, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
        'Content-Disposition': 'attachment; filename="formatted_code.txt"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
