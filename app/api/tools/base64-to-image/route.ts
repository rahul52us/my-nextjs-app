import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const contentType = request.headers.get('content-type') || '';
    let base64: string;
    let mimeType = 'image/png';
    let fileName = 'image.png';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      base64 = body.base64 ?? body.text ?? '';
      mimeType = body.mimeType ?? mimeType;
      fileName = body.fileName ?? fileName;
    } else {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const rawText = formData.get('base64') as string | null;
      base64 = rawText ? rawText.trim() : file ? (await file.text()).trim() : '';
      mimeType = (formData.get('mimeType') as string) ?? mimeType;
      fileName = (formData.get('fileName') as string) ?? fileName;
    }

    if (!base64) return NextResponse.json({ error: 'Provide base64 image string' }, { status: 400 });

    const match = base64.match(/^data:(image\/[^;]+);base64,(.+)$/);
    if (match) {
      mimeType = match[1];
      base64 = match[2];
      const extMap: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif' };
      fileName = `image.${extMap[mimeType] || 'png'}`;
    }

    const buffer = Buffer.from(base64, 'base64');

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to decode image' }, { status: 500 });
  }
}
