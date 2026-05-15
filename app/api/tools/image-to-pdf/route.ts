import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No image files provided' }, { status: 400 });
    }

    const pdfDoc = await PDFDocument.create();

    for (const file of files) {
      const supportedFormats = ['image/jpeg', 'image/png', 'image/webp'];
      if (!supportedFormats.includes(file.type)) {
        return NextResponse.json(
          { error: `Unsupported format: ${file.name}. Supported: JPEG, PNG, WebP` },
          { status: 400 }
        );
      }

      const buffer = await file.arrayBuffer();
      let imageBytes: Uint8Array;

      // Convert to PNG if needed
      if (file.type !== 'image/png') {
        imageBytes = await sharp(buffer).png().toBuffer(); // Buffer extends Uint8Array ✅
      } else {
        imageBytes = new Uint8Array(buffer);
      }

      const image = await pdfDoc.embedPng(imageBytes);
      const { width, height } = image.scale(1);

      const page = pdfDoc.addPage([width, height]);
      page.drawImage(image, { x: 0, y: 0, width, height });
    }

    const pdfBytes = await pdfDoc.save();

    return NextResponse.json({
      success: true,
      pdf: Buffer.from(pdfBytes).toString('base64'),
      pages: files.length,
      fileName: 'images-to-pdf.pdf'
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to convert images to PDF' },
      { status: 500 }
    );
  }
}