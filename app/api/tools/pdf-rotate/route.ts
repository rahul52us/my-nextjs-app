import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, degrees } from 'pdf-lib';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const angle = parseInt(formData.get('angle') as string || '90', 10); // 90, 180, 270

    if (!file) return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Invalid file. Please upload a PDF' }, { status: 400 });
    }
    if (![90, 180, 270].includes(angle)) {
      return NextResponse.json({ error: 'Angle must be 90, 180, or 270' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(bytes);
    const pages = pdfDoc.getPages();
    pages.forEach((page) => page.setRotation(degrees(angle)));

    const pdfBytes = await pdfDoc.save();
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="rotated.pdf"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to rotate PDF' }, { status: 500 });
  }
}
