import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Compares two PDFs and returns a report PDF highlighting page count / size differences
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const formData = await request.formData();
    const file1 = formData.get('file1') as File | null;
    const file2 = formData.get('file2') as File | null;

    // Also support single "file" key (workflow passes single file — compare with itself won't make sense,
    // so we return a helpful message in that case)
    if (!file1 && !file2) {
      const single = formData.get('file') as File | null;
      if (!single) return NextResponse.json({ error: 'Provide file1 and file2 for comparison' }, { status: 400 });
      return NextResponse.json({ error: 'PDF Difference requires two files. Please use file1 and file2 fields.' }, { status: 400 });
    }

    if (!file1 || !file2) {
      return NextResponse.json({ error: 'Both file1 and file2 are required for comparison' }, { status: 400 });
    }

    const [bytes1, bytes2] = await Promise.all([file1.arrayBuffer(), file2.arrayBuffer()]);
    const [pdf1, pdf2] = await Promise.all([PDFDocument.load(bytes1), PDFDocument.load(bytes2)]);

    const pageCount1 = pdf1.getPageCount();
    const pageCount2 = pdf2.getPageCount();

    // Build a simple text-report PDF
    const reportDoc = await PDFDocument.create();
    const font = await reportDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await reportDoc.embedFont(StandardFonts.HelveticaBold);
    const page = reportDoc.addPage([595, 841]);
    const { width, height } = page.getSize();

    let y = height - 60;
    const lineH = 20;
    const margin = 50;

    const writeLine = (text: string, bold = false, color = rgb(0, 0, 0)) => {
      if (y < 60) return;
      page.drawText(text, { x: margin, y, size: 12, font: bold ? boldFont : font, color });
      y -= lineH;
    };

    writeLine('PDF Difference Report', true);
    writeLine('─'.repeat(60));
    y -= 10;
    writeLine(`File 1: ${file1.name}`);
    writeLine(`File 2: ${file2.name}`);
    y -= 10;
    writeLine('─'.repeat(60));
    y -= 10;

    writeLine(`Page Count — File 1: ${pageCount1}  |  File 2: ${pageCount2}`, true,
      pageCount1 !== pageCount2 ? rgb(0.8, 0.1, 0.1) : rgb(0.1, 0.6, 0.1));

    if (pageCount1 !== pageCount2) {
      writeLine(`⚠  Page count differs by ${Math.abs(pageCount1 - pageCount2)} page(s)`, false, rgb(0.8, 0.3, 0));
    } else {
      writeLine('✓  Page counts match', false, rgb(0.1, 0.6, 0.1));
    }

    y -= 10;
    writeLine('Page Size Comparison:', true);

    const maxPages = Math.max(pageCount1, pageCount2);
    for (let i = 0; i < maxPages; i++) {
      const p1 = i < pageCount1 ? pdf1.getPage(i).getSize() : null;
      const p2 = i < pageCount2 ? pdf2.getPage(i).getSize() : null;

      const label = `Page ${i + 1}:`;
      if (!p1) {
        writeLine(`  ${label} Missing in File 1`, false, rgb(0.8, 0.1, 0.1));
      } else if (!p2) {
        writeLine(`  ${label} Missing in File 2`, false, rgb(0.8, 0.1, 0.1));
      } else {
        const match = Math.abs(p1.width - p2.width) < 1 && Math.abs(p1.height - p2.height) < 1;
        const color = match ? rgb(0.1, 0.6, 0.1) : rgb(0.8, 0.1, 0.1);
        writeLine(`  ${label} ${match ? '✓ Same size' : `✗ Differs — F1: ${p1.width.toFixed(0)}x${p1.height.toFixed(0)}  F2: ${p2.width.toFixed(0)}x${p2.height.toFixed(0)}`}`, false, color);
      }

      if (y < 80) break;
    }

    const pdfBytes = await reportDoc.save();
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="pdf-difference-report.pdf"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to compare PDFs' }, { status: 500 });
  }
}
