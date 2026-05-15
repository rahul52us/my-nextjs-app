import { NextRequest, NextResponse } from 'next/server';

function jsonToCSV(data: any[]): string {
  if (!data || data.length === 0) {
    return '';
  }

  // Get all unique keys from all objects
  const keys = [...new Set(data.flatMap((obj) => Object.keys(obj)))];

  // Create header row
  const header = keys.map((key) => `"${key}"`).join(',');

  // Create data rows
  const rows = data.map((obj) =>
    keys
      .map((key) => {
        const value = obj[key];
        if (value === null || value === undefined) {
          return '';
        }
        const stringValue = String(value).replace(/"/g, '""');
        return `"${stringValue}"`;
      })
      .join(',')
  );

  return [header, ...rows].join('\n');
}

export async function POST(request: NextRequest) {
  try {
    const { data } = await request.json();

    if (!data || !Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Invalid input. Expected an array of objects' },
        { status: 400 }
      );
    }

    if (data.length === 0) {
      return NextResponse.json(
        { error: 'Data array is empty' },
        { status: 400 }
      );
    }

    const csv = jsonToCSV(data);

    return NextResponse.json({
      success: true,
      csv,
      rows: data.length,
      fileName: 'data.csv'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to convert JSON to CSV' },
      { status: 500 }
    );
  }
}
