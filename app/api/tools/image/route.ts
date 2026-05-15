import { NextRequest, NextResponse } from 'next/server';

const parseDataUri = (text: string) => {
  const match = text.match(/^data:(.*?);base64,([\s\S]*)$/);
  if (!match) return null;
  return { mimeType: match[1], base64Data: match[2] };
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No Base64 input provided' }, { status: 400 });
    }

    const text = await file.text();
    const parsed = parseDataUri(text.trim());
    let mimeType = 'image/png';
    let base64Data = text.trim();

    if (parsed) {
      mimeType = parsed.mimeType || mimeType;
      base64Data = parsed.base64Data;
    } else if (file.name) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
      else if (ext === 'gif') mimeType = 'image/gif';
      else if (ext === 'webp') mimeType = 'image/webp';
      else if (ext === 'bmp') mimeType = 'image/bmp';
    }

    const imageBuffer = Buffer.from(base64Data, 'base64');
    const fileName = file.name?.replace(/\.[^.]+$/, '') || 'image';
    const extension = mimeType.split('/')[1] || 'png';

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${fileName}.${extension}"`,
      },
    });
  } catch (error) {
    console.error('Base64 to Image conversion error:', error);
    return NextResponse.json({ error: 'Failed to convert Base64 to image' }, { status: 500 });
  }
}
