import { NextRequest, NextResponse } from 'next/server';

// Accepts: JSON { url } OR formData { url } OR file containing a URL as text
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const contentType = request.headers.get('content-type') || '';
    let url: string;

    if (contentType.includes('application/json')) {
      const body = await request.json();
      url = body.url ?? body.text ?? '';
    } else {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const rawUrl = formData.get('url') as string | null;
      url = rawUrl ? rawUrl.trim() : file ? (await file.text()).trim() : '';
    }

    if (!url) return NextResponse.json({ error: 'Provide a URL' }, { status: 400 });

    try { new URL(url); } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json({ error: `Failed to fetch URL: ${res.status} ${res.statusText}` }, { status: 400 });
    }

    const buffer = await res.arrayBuffer();
    const mimeType = res.headers.get('content-type') || 'application/octet-stream';
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json({
      success: true,
      url,
      mimeType,
      size: buffer.byteLength,
      base64,
      dataUrl,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to convert URL to base64' }, { status: 500 });
  }
}
