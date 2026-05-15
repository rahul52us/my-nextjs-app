import { NextRequest, NextResponse } from 'next/server';
import { read, utils } from 'xlsx';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No Excel file provided' }, { status: 400 });
    }

    const supportedFormats = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (!supportedFormats.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      return NextResponse.json(
        { error: 'Invalid file format. Supported: XLSX, XLS, CSV' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = read(arrayBuffer, { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = utils.sheet_to_json(worksheet);

    const pdfDoc = await PDFDocument.create();
    const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const { width, height } = page.getSize();

    let yPosition = height - 40;
    const fontSize = 10;
    const margin = 40;
    const maxWidth = width - 2 * margin;

    // Add title
    page.drawText(file.name, {
      x: margin,
      y: yPosition,
      size: 14,
      font: timesRoman,
      color: rgb(0, 0, 0)
    });

    yPosition -= 20;

    // Add data
    if (data.length > 0) {
      const keys = Object.keys(data[0]);
      const cellWidth = maxWidth / keys.length;

      // Header
      keys.forEach((key, index) => {
        page.drawText(key.substring(0, 15), {
          x: margin + index * cellWidth,
          y: yPosition,
          size: fontSize,
          font: timesRoman,
          color: rgb(0, 0, 0)
        });
      });

      yPosition -= 15;

      // Data rows
      for (const row of data) {
        if (yPosition < margin) {
          const newPage = pdfDoc.addPage([595, 842]);
          yPosition = height - 40;
        }

        keys.forEach((key, index) => {
          const value = String(row[key]).substring(0, 20);
          page.drawText(value, {
            x: margin + index * cellWidth,
            y: yPosition,
            size: fontSize,
            font: timesRoman,
            color: rgb(0, 0, 0)
          });
        });

        yPosition -= 12;
      }
    }

    const pdfBytes = await pdfDoc.save();

    return NextResponse.json({
      success: true,
      pdf: Buffer.from(pdfBytes).toString('base64'),
      rows: data.length,
      fileName: 'excel-to-pdf.pdf'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to convert Excel to PDF' },
      { status: 500 }
    );
  }
}
