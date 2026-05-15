import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUrl = `data:${file.type || 'application/octet-stream'};base64,${base64}`;

    return NextResponse.json({
      success: true,
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
      base64,
      dataUrl,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to convert file to base64' }, { status: 500 });
  }
}
