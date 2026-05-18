import { NextRequest, NextResponse } from 'next/server';
import { getTextInput, decimalToBinary } from '../binaryHelpers';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const decimal = await getTextInput(request);
    if (!decimal) {
      return NextResponse.json({ error: 'Provide decimal numbers or a file containing decimal data.' }, { status: 400 });
    }

    const output = decimalToBinary(decimal);
    return new NextResponse(output, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': 'attachment; filename="decimal-to-binary.txt"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to convert decimal to binary.' }, { status: 500 });
  }
}
