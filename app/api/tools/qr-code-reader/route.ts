import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import jsQR from 'jsqr';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided.' }, { status: 400 });
    }

    const supportedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/tiff', 'image/bmp'];
    if (file.type && !supportedFormats.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported image format. Supported: JPEG, PNG, WebP, GIF, TIFF, BMP.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let image;
    try {
      image = sharp(buffer).ensureAlpha();
    } catch (err) {
      return NextResponse.json({ error: 'Unsupported image format or corrupt image.' }, { status: 400 });
    }
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      return NextResponse.json({ error: 'Unable to read image dimensions.' }, { status: 400 });
    }

    const rawBuffer = await image.raw().toBuffer();
    const decoded = jsQR(new Uint8ClampedArray(rawBuffer), metadata.width, metadata.height);

    if (!decoded || !decoded.data) {
      return NextResponse.json({ error: 'No QR code found in the uploaded image.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, text: decoded.data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to decode QR code.' },
      { status: 500 }
    );
  }
}
