import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 PDF files are required for merging' },
        { status: 400 }
      );
    }

    // Validate all files are PDFs
    for (const file of files) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        return NextResponse.json(
          { error: `Invalid file format: ${file.name}. All files must be PDF files` },
          { status: 400 }
        );
      }
    }

    // Create a new PDF document
    const mergedPdf = await PDFDocument.create();

    // Process each PDF file
    for (const file of files) {
      const fileBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(fileBuffer);

      // Copy all pages from the current PDF to the merged PDF
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach(page => mergedPdf.addPage(page));
    }

    // Serialize the merged PDF
    const mergedPdfBytes = await mergedPdf.save();

    // Return the merged PDF as a blob
    const pdfBlob = new Blob([mergedPdfBytes], { type: 'application/pdf' });

    return new NextResponse(pdfBlob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="merged.pdf"',
      },
    });

  } catch (error) {
    console.error('PDF merge error:', error);
    return NextResponse.json(
      { error: 'Failed to merge PDF files' },
      { status: 500 }
    );
  }
}