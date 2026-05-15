import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

// order: JSON string array of 1-based page numbers e.g. "[3,1,2]"
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const orderRaw = formData.get('order') as string | null;

    if (!file) return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Invalid file. Please upload a PDF' }, { status: 400 });
    }
    if (!orderRaw) return NextResponse.json({ error: 'Page order is required (e.g. [3,1,2])' }, { status: 400 });

    const order: number[] = JSON.parse(orderRaw);
    const bytes = await file.arrayBuffer();
    const srcDoc = await PDFDocument.load(bytes);
    const totalPages = srcDoc.getPageCount();

    for (const p of order) {
      if (p < 1 || p > totalPages) {
        return NextResponse.json({ error: `Invalid page number: ${p}. PDF has ${totalPages} pages.` }, { status: 400 });
      }
    }

    const newDoc = await PDFDocument.create();
    const indices = order.map((p) => p - 1);
    const copiedPages = await newDoc.copyPages(srcDoc, indices);
    copiedPages.forEach((page) => newDoc.addPage(page));

    const pdfBytes = await newDoc.save();
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="rearranged.pdf"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to rearrange PDF pages' }, { status: 500 });
  }
}
