import { NextRequest, NextResponse } from 'next/server';
import csv from 'csv-parser';
import { Readable } from 'stream';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No CSV file provided' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
      return NextResponse.json(
        { error: 'Invalid file format. Only CSV files are supported' },
        { status: 400 }
      );
    }

    const text = await file.text();

    // CSV parsing ko alag helper mein nikaala
    const results = await parseCsv(text);

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
      fileName: file.name,
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to convert CSV to JSON' },
      { status: 500 }
    );
  }
}

// Helper: CSV string → array of objects
function parseCsv(text: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    Readable.from([text])
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}