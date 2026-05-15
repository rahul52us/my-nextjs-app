import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Accepts: file (PDF), texts (JSON string array of {text, x, y, page, size, r, g, b})
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const textsRaw = formData.get('texts') as string | null;

    if (!file) return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Invalid file. Please upload a PDF' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(bytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();

    if (textsRaw) {
      const texts: { text: string; x: number; y: number; page?: number; size?: number; r?: number; g?: number; b?: number }[] = JSON.parse(textsRaw);
      for (const item of texts) {
        const pageIndex = (item.page ?? 1) - 1;
        if (pageIndex < 0 || pageIndex >= pages.length) continue;
        pages[pageIndex].drawText(item.text, {
          x: item.x ?? 50,
          y: item.y ?? 50,
          size: item.size ?? 12,
          font,
          color: rgb(item.r ?? 0, item.g ?? 0, item.b ?? 0),
        });
      }
    }

    const pdfBytes = await pdfDoc.save();
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="edited.pdf"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to edit PDF' }, { status: 500 });
  }
}
