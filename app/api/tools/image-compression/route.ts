import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const quality = parseInt(formData.get('quality') as string) || 80;
    const width = formData.get('width') ? parseInt(formData.get('width') as string) : null;
    const height = formData.get('height') ? parseInt(formData.get('height') as string) : null;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    const supportedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!supportedFormats.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported image format. Supported: JPEG, PNG, WebP, AVIF' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    let image = sharp(buffer);

    // Resize if dimensions provided
    if (width || height) {
      image = image.resize(width || undefined, height || undefined, {
        withoutEnlargement: true
      });
    }

    // Compress based on format
    let compressed;
    const ext = file.type.split('/')[1];

    if (ext === 'jpeg') {
      compressed = await image.jpeg({ quality, progressive: true }).toBuffer();
    } else if (ext === 'png') {
      compressed = await image.png({ quality }).toBuffer();
    } else if (ext === 'webp') {
      compressed = await image.webp({ quality }).toBuffer();
    } else {
      compressed = await image.avif({ quality }).toBuffer();
    }

    const originalSize = buffer.byteLength;
    const compressedSize = compressed.length;
    const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);

    return NextResponse.json({
      success: true,
      originalSize,
      compressedSize,
      reduction: `${reduction}%`,
      image: Buffer.from(compressed).toString('base64'),
      format: ext
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to compress image' },
      { status: 500 }
    );
  }
}
