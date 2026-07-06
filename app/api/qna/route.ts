import { NextRequest, NextResponse } from 'next/server';

const QNA_API_URL = 'https://ocr-qsiz.onrender.com/api/qna';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = typeof body.text === 'string' ? body.text.trim() : '';
    const question = typeof body.question === 'string' ? body.question.trim() : '';

    if (!text) {
      return NextResponse.json(
        { error: 'No document text provided.' },
        { status: 400 },
      );
    }

    if (!question) {
      return NextResponse.json(
        { error: 'No question provided.' },
        { status: 400 },
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000);

    try {
      const response = await fetch(QNA_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, question }),
        signal: controller.signal,
      });

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        return NextResponse.json(
          {
            error:
              typeof data === 'object' && data && 'error' in data
                ? String(data.error)
                : 'Q&A backend request failed.',
            detail: data,
          },
          { status: response.status },
        );
      }

      return NextResponse.json(data);
    } finally {
      clearTimeout(timeout);
    }
  } catch (error: any) {
    const isTimeout = error?.name === 'AbortError';
    return NextResponse.json(
      {
        error: isTimeout
          ? 'The Q&A server is taking longer than expected. This may take up to 30-60 seconds if the server was asleep. Please try again.'
          : error?.message || 'Unable to reach the Q&A server.',
      },
      { status: isTimeout ? 504 : 500 },
    );
  }
}