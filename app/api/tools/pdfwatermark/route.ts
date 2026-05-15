import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const watermarkText = formData.get('watermarkText') as string || 'WATERMARK';
    const opacity = parseFloat(formData.get('opacity') as string) || 0.3;
    const fontSize = parseFloat(formData.get('fontSize') as string) || 50;
    const color = formData.get('color') as string || '#FF0000'; // Default red

    if (!file) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Invalid file format. Please upload a PDF file' }, { status: 400 });
    }

    // Load the PDF
    const fileBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(fileBuffer);

    // Get the font
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Parse color
    const colorMatch = color.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    const r = colorMatch ? parseInt(colorMatch[1], 16) / 255 : 1;
    const g = colorMatch ? parseInt(colorMatch[2], 16) / 255 : 0;
    const b = colorMatch ? parseInt(colorMatch[3], 16) / 255 : 0;

    // Process each page
    const pages = pdfDoc.getPages();
    for (const page of pages) {
      const { width, height } = page.getSize();

      // Add watermark text across the page
      page.drawText(watermarkText, {
        x: width / 2 - (font.widthOfTextAtSize(watermarkText, fontSize) / 2),
        y: height / 2,
        size: fontSize,
        font: font,
        color: rgb(r, g, b),
        opacity: opacity,
      });
    }

    // Serialize the watermarked PDF
    const pdfBytes = await pdfDoc.save();

    // Return the watermarked PDF as a blob
    const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

    return new NextResponse(pdfBlob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${file.name.replace('.pdf', '_watermarked.pdf')}"`,
      },
    });

  } catch (error) {
    console.error('PDF watermark error:', error);
    return NextResponse.json(
      { error: 'Failed to add watermark to PDF' },
      { status: 500 }
    );
  }
}