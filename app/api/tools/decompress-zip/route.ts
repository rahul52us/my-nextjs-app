import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';

// Returns: JSON with files array [{name, base64, mimeType}]
// Or if single file in ZIP, returns that file directly
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const returnAs = (formData.get('returnAs') as string) || 'json'; // 'json' | 'first-file'

    if (!file) return NextResponse.json({ error: 'No ZIP file provided' }, { status: 400 });
    if (!file.name.toLowerCase().endsWith('.zip') && file.type !== 'application/zip' && file.type !== 'application/x-zip-compressed') {
      return NextResponse.json({ error: 'Invalid file. Please upload a ZIP file' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(buffer);

    const entries: { name: string; base64: string; size: number }[] = [];

    for (const [name, zipEntry] of Object.entries(zip.files)) {
      if (zipEntry.dir) continue;
      const content = await zipEntry.async('base64');
      const rawBuffer = await zipEntry.async('nodebuffer');
      entries.push({ name, base64: content, size: rawBuffer.length });
    }

    if (entries.length === 0) {
      return NextResponse.json({ error: 'ZIP file is empty' }, { status: 400 });
    }

    // If workflow chaining: return first file as binary
    if (returnAs === 'first-file' || entries.length === 1) {
      const first = entries[0];
      const rawBuffer = Buffer.from(first.base64, 'base64');
      const ext = first.name.split('.').pop() || 'bin';
      const mimeMap: Record<string, string> = {
        pdf: 'application/pdf', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
        webp: 'image/webp', txt: 'text/plain', csv: 'text/csv', json: 'application/json',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };
      return new NextResponse(rawBuffer, {
        status: 200,
        headers: {
          'Content-Type': mimeMap[ext] || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${first.name}"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      count: entries.length,
      files: entries.map(({ name, base64, size }) => ({ name, base64, size })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to decompress ZIP' }, { status: 500 });
  }
}
