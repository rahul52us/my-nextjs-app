import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    
    // Premium mock background removal: We convert image to PNG, ensure alpha channel,
    // and make pure white/near-white pixels transparent as a smart default chroma-key.
    const rawImage = sharp(buffer).ensureAlpha();
    const { data, info } = await rawImage.raw().toBuffer({ resolveWithObject: true });
    
    // Pixel manipulation to remove light/white background
    const threshold = 240; // threshold for white
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (r > threshold && g > threshold && b > threshold) {
        data[i + 3] = 0; // set alpha to transparent
      }
    }

    const processedBuffer = await sharp(data, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4
      }
    }).png().toBuffer();

    return NextResponse.json({
      success: true,
      image: processedBuffer.toString('base64'),
      format: 'png'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to remove background' },
      { status: 500 }
    );
  }
}
