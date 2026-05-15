import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

// Fields: file, width, height, brightness (0.1-3), contrast (0.1-3), grayscale (true/false), rotate (degrees), flip (true/false)
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) return NextResponse.json({ error: 'No image file provided' }, { status: 400 });

    const supportedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/tiff'];
    if (!supportedFormats.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported format. Supported: JPEG, PNG, WebP, GIF, TIFF' }, { status: 400 });
    }

    const width = formData.get('width') ? parseInt(formData.get('width') as string, 10) : undefined;
    const height = formData.get('height') ? parseInt(formData.get('height') as string, 10) : undefined;
    const brightness = formData.get('brightness') ? parseFloat(formData.get('brightness') as string) : undefined;
    const contrast = formData.get('contrast') ? parseFloat(formData.get('contrast') as string) : undefined;
    const grayscale = formData.get('grayscale') === 'true';
    const rotate = formData.get('rotate') ? parseInt(formData.get('rotate') as string, 10) : undefined;
    const flip = formData.get('flip') === 'true';
    const flop = formData.get('flop') === 'true';

    const buffer = await file.arrayBuffer();
    let pipeline = sharp(Buffer.from(buffer));

    if (width || height) pipeline = pipeline.resize(width, height, { fit: 'inside', withoutEnlargement: true });
    if (rotate) pipeline = pipeline.rotate(rotate);
    if (flip) pipeline = pipeline.flip();
    if (flop) pipeline = pipeline.flop();
    if (grayscale) pipeline = pipeline.grayscale();
    if (brightness !== undefined || contrast !== undefined) {
      pipeline = pipeline.modulate({
        brightness: brightness ?? 1,
        ...(contrast !== undefined ? { saturation: contrast } : {}),
      });
    }

    const outputBuffer = await pipeline.toBuffer();
    const ext = file.name.split('.').pop() || 'jpg';
    const outputName = `edited.${ext}`;

    return new NextResponse(outputBuffer, {
      status: 200,
      headers: {
        'Content-Type': file.type,
        'Content-Disposition': `attachment; filename="${outputName}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to edit image' }, { status: 500 });
  }
}
