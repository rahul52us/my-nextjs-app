import './polyfill';
import { NextRequest, NextResponse } from 'next/server';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'Invalid file format. Only PDF files are supported' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    
    let extractedText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      extractedText += `--- Page ${pageNum} ---\n${pageText}\n\n`;
    }

    return NextResponse.json({
      success: true,
      text: extractedText,
      pages: pdf.numPages,
      fileName: file.name
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to extract text from PDF' },
      { status: 500 }
    );
  }
}
