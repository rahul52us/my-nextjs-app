import { NextRequest, NextResponse } from 'next/server';
import { fileToBinary } from '../binaryHelpers';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Provide a file to convert to binary.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const output = fileToBinary(buffer);

    return new NextResponse(output, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': 'attachment; filename="file-to-binary.txt"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to convert file to binary.' }, { status: 500 });
  }
}
