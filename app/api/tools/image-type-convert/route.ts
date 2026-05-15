import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

const formatMap: Record<string, { mime: string; sharpFormat: keyof sharp.FormatEnum }> = {
  jpg: { mime: 'image/jpeg', sharpFormat: 'jpeg' },
  jpeg: { mime: 'image/jpeg', sharpFormat: 'jpeg' },
  png: { mime: 'image/png', sharpFormat: 'png' },
  webp: { mime: 'image/webp', sharpFormat: 'webp' },
  gif: { mime: 'image/gif', sharpFormat: 'gif' },
  tiff: { mime: 'image/tiff', sharpFormat: 'tiff' },
  avif: { mime: 'image/avif', sharpFormat: 'avif' },
};

// Fields: file, format (target format: jpg|png|webp|gif|tiff|avif)
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const targetFormat = ((formData.get('format') as string) || 'png').toLowerCase();

    if (!file) return NextResponse.json({ error: 'No image file provided' }, { status: 400 });

    const formatInfo = formatMap[targetFormat];
    if (!formatInfo) {
      return NextResponse.json({ error: `Unsupported target format: ${targetFormat}. Supported: jpg, png, webp, gif, tiff, avif` }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const outputBuffer = await sharp(Buffer.from(buffer))
      .toFormat(formatInfo.sharpFormat)
      .toBuffer();

    const baseName = file.name.replace(/\.[^.]+$/, '');

    return new NextResponse(outputBuffer, {
      status: 200,
      headers: {
        'Content-Type': formatInfo.mime,
        'Content-Disposition': `attachment; filename="${baseName}.${targetFormat}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to convert image' }, { status: 500 });
  }
}
