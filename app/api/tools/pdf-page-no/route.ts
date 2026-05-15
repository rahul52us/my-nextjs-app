import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const position = (formData.get('position') as string) || 'bottom-center'; // top-left, top-center, top-right, bottom-left, bottom-center, bottom-right
    const fontSize = parseInt(formData.get('fontSize') as string || '12', 10);
    const startFrom = parseInt(formData.get('startFrom') as string || '1', 10);

    if (!file) return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Invalid file. Please upload a PDF' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(bytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();

    pages.forEach((page, index) => {
      const { width, height } = page.getSize();
      const pageNum = `${startFrom + index}`;
      const textWidth = font.widthOfTextAtSize(pageNum, fontSize);
      const margin = 30;

      let x = width / 2 - textWidth / 2;
      let y = margin;

      if (position.includes('top')) y = height - margin - fontSize;
      if (position.includes('left')) x = margin;
      if (position.includes('right')) x = width - margin - textWidth;

      page.drawText(pageNum, { x, y, size: fontSize, font, color: rgb(0.3, 0.3, 0.3) });
    });

    const pdfBytes = await pdfDoc.save();
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="numbered.pdf"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to add page numbers' }, { status: 500 });
  }
}
