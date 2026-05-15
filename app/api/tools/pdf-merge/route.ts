import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('file') as File[];

    if (!files || files.length < 2) {
      return NextResponse.json({ error: 'At least two PDF files are required for merging' }, { status: 400 });
    }

    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        continue;
      }
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const pdfBytes = await mergedPdf.save();
    const base64 = Buffer.from(pdfBytes).toString('base64');

    return NextResponse.json({
      success: true,
      pdf: base64,
      pages: mergedPdf.getPageCount(),
      fileName: 'merged-document.pdf'
    });
  } catch (error: any) {
    console.error('PDF Merge Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to merge PDF files' },
      { status: 500 }
    );
  }
}