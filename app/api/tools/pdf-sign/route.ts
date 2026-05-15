import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Fields: file, signature (text), page (1-based, default last), x, y, fontSize
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const signature = (formData.get('signature') as string) || 'Signed';
    const pageNum = parseInt(formData.get('page') as string || '0', 10); // 0 = last page
    const x = parseFloat(formData.get('x') as string || '60');
    const y = parseFloat(formData.get('y') as string || '60');
    const fontSize = parseFloat(formData.get('fontSize') as string || '20');

    if (!file) return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Invalid file. Please upload a PDF' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(bytes);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    const pages = pdfDoc.getPages();

    const targetIndex = pageNum === 0 ? pages.length - 1 : Math.min(pageNum - 1, pages.length - 1);
    const targetPage = pages[targetIndex];

    // Draw signature box
    targetPage.drawRectangle({
      x: x - 5,
      y: y - 5,
      width: font.widthOfTextAtSize(signature, fontSize) + 10,
      height: fontSize + 10,
      borderColor: rgb(0.1, 0.3, 0.7),
      borderWidth: 1,
    });

    targetPage.drawText(signature, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.1, 0.3, 0.7),
    });

    // Add signed timestamp at bottom
    const timestampFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const timestamp = `Signed on: ${new Date().toUTCString()}`;
    targetPage.drawText(timestamp, {
      x,
      y: y - 20,
      size: 8,
      font: timestampFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    const pdfBytes = await pdfDoc.save();
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="signed.pdf"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to sign PDF' }, { status: 500 });
  }
}
