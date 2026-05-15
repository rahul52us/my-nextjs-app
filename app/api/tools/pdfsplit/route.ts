import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const splitType = formData.get('splitType') as string || 'individual'; // 'individual' or 'range'
    const pageRange = formData.get('pageRange') as string; // e.g., "1-3,5,7-9"

    if (!file) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Invalid file format. Please upload a PDF file' }, { status: 400 });
    }

    // Load the PDF
    const fileBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(fileBuffer);
    const totalPages = pdfDoc.getPageCount();

    if (splitType === 'individual') {
      // Split into individual pages
      const zip = new JSZip();

      for (let i = 0; i < totalPages; i++) {
        const newPdf = await PDFDocument.create();
        const [page] = await newPdf.copyPages(pdfDoc, [i]);
        newPdf.addPage(page);

        const pdfBytes = await newPdf.save();
        zip.file(`page_${i + 1}.pdf`, pdfBytes);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });

      return new NextResponse(zipBlob, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="${file.name.replace('.pdf', '_split.zip')}"`,
        },
      });

    } else if (splitType === 'range' && pageRange) {
      // Split by page ranges
      const ranges = parsePageRanges(pageRange, totalPages);
      const zip = new JSZip();

      for (let i = 0; i < ranges.length; i++) {
        const range = ranges[i];
        const newPdf = await PDFDocument.create();
        const pages = await newPdf.copyPages(pdfDoc, range);
        pages.forEach(page => newPdf.addPage(page));

        const pdfBytes = await newPdf.save();
        const rangeStr = range.length === 1
          ? `page_${range[0] + 1}`
          : `pages_${range[0] + 1}-${range[range.length - 1] + 1}`;
        zip.file(`${rangeStr}.pdf`, pdfBytes);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });

      return new NextResponse(zipBlob, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="${file.name.replace('.pdf', '_split.zip')}"`,
        },
      });

    } else {
      return NextResponse.json({ error: 'Invalid split type or missing page range' }, { status: 400 });
    }

  } catch (error) {
    console.error('PDF split error:', error);
    return NextResponse.json(
      { error: 'Failed to split PDF' },
      { status: 500 }
    );
  }
}

function parsePageRanges(rangeStr: string, totalPages: number): number[][] {
  const ranges: number[][] = [];
  const parts = rangeStr.split(',').map(p => p.trim());

  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(n => parseInt(n.trim()) - 1); // Convert to 0-based
      if (!isNaN(start) && !isNaN(end) && start <= end && start >= 0 && end < totalPages) {
        const range: number[] = [];
        for (let i = start; i <= end; i++) {
          range.push(i);
        }
        ranges.push(range);
      }
    } else {
      const page = parseInt(part) - 1; // Convert to 0-based
      if (!isNaN(page) && page >= 0 && page < totalPages) {
        ranges.push([page]);
      }
    }
  }

  return ranges;
}