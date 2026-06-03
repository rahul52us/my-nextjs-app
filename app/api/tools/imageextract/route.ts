import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No PDF or file provided' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    
    // Check if it's a PDF. If so, we'll try to extract images or convert the first page.
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      const pdfDoc = await PDFDocument.load(buffer);
      const pages = pdfDoc.getPages();
      
      // Return details of PDF pages
      return NextResponse.json({
        success: true,
        message: 'Successfully analyzed PDF file',
        data: {
          pagesCount: pages.length,
          name: file.name
        }
      });
    }

    // Default: return details of the uploaded file
    return NextResponse.json({
      success: true,
      message: 'Analyzed uploaded file',
      data: {
        name: file.name,
        size: file.size,
        type: file.type
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to extract images' },
      { status: 500 }
    );
  }
}
