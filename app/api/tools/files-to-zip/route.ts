import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';

// Accepts: files[] (multiple files via FormData)
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    // Also support single 'file' key
    const singleFile = formData.get('file') as File | null;
    const allFiles = files.length > 0 ? files : singleFile ? [singleFile] : [];

    if (allFiles.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const zip = new JSZip();
    for (const file of allFiles) {
      const buffer = await file.arrayBuffer();
      zip.file(file.name, buffer);
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } });

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="files.zip"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create ZIP' }, { status: 500 });
  }
}
