import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const sheetName = formData.get('sheet') as string | null; // optional sheet name

    if (!file) return NextResponse.json({ error: 'No Excel file provided' }, { status: 400 });

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (!file.name.match(/\.(xlsx|xls)$/i) && !validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file. Please upload an Excel (.xlsx or .xls) file' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    const sheet = sheetName && workbook.SheetNames.includes(sheetName)
      ? workbook.Sheets[sheetName]
      : workbook.Sheets[workbook.SheetNames[0]];

    const csv = XLSX.utils.sheet_to_csv(sheet);
    const outputName = file.name.replace(/\.(xlsx|xls)$/i, '.csv');

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${outputName}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to convert Excel to CSV' }, { status: 500 });
  }
}
