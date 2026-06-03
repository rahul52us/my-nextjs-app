import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    let jsonData: any[];
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      jsonData = body.data ?? body;
    } else {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const text = formData.get('text') as string | null;

      if (text) {
        jsonData = JSON.parse(text);
      } else if (file) {
        jsonData = JSON.parse(await file.text());
      } else {
        return NextResponse.json({ error: 'Provide text or file field containing JSON array' }, { status: 400 });
      }
    }

    if (!Array.isArray(jsonData)) {
      // If it's a single object, wrap it in an array
      jsonData = [jsonData];
    }

    const worksheet = XLSX.utils.json_to_sheet(jsonData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="converted.xlsx"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to convert JSON to Excel: ' + error.message }, { status: 500 });
  }
}
