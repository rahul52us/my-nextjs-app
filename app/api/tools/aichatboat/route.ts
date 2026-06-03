import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    let message = '';
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      message = body.message ?? body.text ?? '';
    } else {
      const formData = await request.formData();
      message = (formData.get('message') as string) || '';
    }

    if (!message) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }

    const reply = `Hi! You said: "${message}". I am your helpful Assistant chatbot. Let me know how I can assist you further with your files or workflow!`;

    return NextResponse.json({
      success: true,
      text: reply
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
