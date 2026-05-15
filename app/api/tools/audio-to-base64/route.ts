import { NextRequest, NextResponse } from 'next/server';

const SUPPORTED_AUDIO = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac', 'audio/webm'];

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });

    if (!SUPPORTED_AUDIO.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|aac|flac|webm)$/i)) {
      return NextResponse.json({ error: 'Invalid audio file. Supported: MP3, WAV, OGG, AAC, FLAC, WebM' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({
      success: true,
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
      base64,
      dataUrl,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to convert audio to base64' }, { status: 500 });
  }
}
