import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

function stripHtmlTags(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<li>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim();
}

function wrapText(text: string, maxWidth: number, font: any, fontSize: number): string[] {
  const lines: string[] = [];
  const paragraphs = text.split('\n');

  paragraphs.forEach((paragraph) => {
    if (!paragraph.trim()) {
      lines.push('');
      return;
    }

    const words = paragraph.split(/\s+/);
    let line = '';

    words.forEach((word) => {
      const testLine = line ? `${line} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, fontSize);
      if (width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    });

    if (line) {
      lines.push(line);
    }
  });

  return lines;
}

export async function POST(request: NextRequest) {
  try {
    const { html, title } = await request.json();

    if (!html) {
      return NextResponse.json({ error: 'No HTML content provided' }, { status: 400 });
    }

    const pdfDoc = await PDFDocument.create();
    const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();

    const margin = 40;
    const maxWidth = width - 2 * margin;
    let yPosition = height - margin;
    const fontSize = 11;
    const lineHeight = 14;

    // Add title if provided
    if (title) {
      page.drawText(title, {
        x: margin,
        y: yPosition,
        size: 16,
        font: timesRoman,
        color: rgb(0, 0, 0)
      });
      yPosition -= 25;
    }

    // Strip HTML and wrap text
    const cleanText = stripHtmlTags(html);
    const lines = wrapText(cleanText, maxWidth, timesRoman, fontSize);

    // Draw text
    for (const line of lines) {
      if (yPosition < margin) {
        const newPage = pdfDoc.addPage([595, 842]);
        yPosition = height - margin;
      }

      page.drawText(line, {
        x: margin,
        y: yPosition,
        size: fontSize,
        font: timesRoman,
        color: rgb(0, 0, 0)
      });

      yPosition -= lineHeight;
    }

    const pdfBytes = await pdfDoc.save();

    return NextResponse.json({
      success: true,
      pdf: Buffer.from(pdfBytes).toString('base64'),
      fileName: 'html-to-pdf.pdf'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to convert HTML to PDF' },
      { status: 500 }
    );
  }
}
