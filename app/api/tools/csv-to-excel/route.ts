import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) return NextResponse.json({ error: 'No CSV file provided' }, { status: 400 });
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
      return NextResponse.json({ error: 'Invalid file. Please upload a CSV file' }, { status: 400 });
    }

    const text = await file.text();
    const workbook = XLSX.read(text, { type: 'string' });
    const xlsxBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    const outputName = file.name.replace(/\.csv$/i, '.xlsx');

    return new NextResponse(xlsxBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${outputName}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to convert CSV to Excel' }, { status: 500 });
  }
}
