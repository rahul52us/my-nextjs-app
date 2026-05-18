import { NextRequest, NextResponse } from 'next/server';
import {
  textToBinary,
  hexToBinary,
  decimalToBinary,
  base64ToBinary,
  fileToBinary,
  binaryToText,
  binaryToAscii,
  binaryToHex,
  binaryToDecimal,
  binaryToBase64,
  binaryToFile,
} from '../binaryHelpers';

const supportedModes = [
  'text-to-binary',
  'ascii-to-binary',
  'hex-to-binary',
  'decimal-to-binary',
  'base64-to-binary',
  'file-to-binary',
  'binary-to-text',
  'binary-to-ascii',
  'binary-to-hex',
  'binary-to-decimal',
  'binary-to-base64',
  'binary-to-file',
];

const filenameMap: Record<string, string> = {
  'text-to-binary': 'text-to-binary.txt',
  'ascii-to-binary': 'ascii-to-binary.txt',
  'hex-to-binary': 'hex-to-binary.txt',
  'decimal-to-binary': 'decimal-to-binary.txt',
  'base64-to-binary': 'base64-to-binary.txt',
  'file-to-binary': 'file-to-binary.txt',
  'binary-to-text': 'binary-to-text.txt',
  'binary-to-ascii': 'binary-to-ascii.txt',
  'binary-to-hex': 'binary-to-hex.txt',
  'binary-to-decimal': 'binary-to-decimal.txt',
  'binary-to-base64': 'binary-to-base64.txt',
  'binary-to-file': 'binary-to-file.bin',
};

async function getTextInputFromFormData(formData: FormData): Promise<string> {
  const fields = ['text', 'input', 'binary', 'ascii', 'hex', 'decimal', 'base64', 'data'];
  for (const field of fields) {
    const value = formData.get(field);
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  const file = formData.get('file') as File | null;
  if (file) {
    return await file.text();
  }

  return '';
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tool: string }> }
) {
  const resolvedParams = await params;
  const tool = resolvedParams.tool?.toLowerCase();

  if (!tool) {
    return NextResponse.json(
      { error: 'Tool slug is missing from the request path.' },
      { status: 400 }
    );
  }

  if (tool !== 'binary') {
    return NextResponse.json(
      {
        error: `The API route for tool '${tool}' exists, but this tool is not implemented on the server yet.`,
        detail: 'Create a specific route implementation under app/api/tools or add support in app/api/tools/[tool]/route.ts.',
      },
      { status: 501 }
    );
  }

  const contentType = request.headers.get('content-type') || '';
  let mode = '';
  let input = '';
  let formFile: File | null = null;

  if (contentType.includes('application/json')) {
    const body = await request.json();
    mode = (body.mode || body.action || body.type || '').toString().toLowerCase();
    input = (body.text || body.input || body.data || body.source || body.value || body.binary || body.ascii || body.hex || body.decimal || body.base64 || '').toString();
  } else {
    const formData = await request.formData();
    mode = ((formData.get('mode') as string) || (formData.get('action') as string) || (formData.get('type') as string) || '').toLowerCase();
    input = await getTextInputFromFormData(formData);
    formFile = formData.get('file') as File | null;
  }

  if (!mode || !supportedModes.includes(mode)) {
    return NextResponse.json(
      {
        error: 'Invalid or missing binary conversion mode.',
        supportedModes,
      },
      { status: 400 }
    );
  }

  if (mode === 'file-to-binary') {
    if (!formFile) {
      return NextResponse.json(
        { error: 'Provide a file under the "file" field for file-to-binary conversion.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await formFile.arrayBuffer());
    const output = fileToBinary(buffer);
    return new NextResponse(output, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="${filenameMap[mode]}"`,
      },
    });
  }

  if (mode === 'binary-to-file') {
    if (!input) {
      return NextResponse.json(
        { error: 'Provide binary text under a supported field for binary-to-file conversion.' },
        { status: 400 }
      );
    }

    const output = binaryToFile(input);
    return new NextResponse(output, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filenameMap[mode]}"`,
      },
    });
  }

  if (!input) {
    return NextResponse.json(
      { error: 'Provide input text or a file for the selected binary conversion mode.' },
      { status: 400 }
    );
  }

  let result = '';
  switch (mode) {
    case 'text-to-binary':
    case 'ascii-to-binary':
      result = textToBinary(input);
      break;
    case 'hex-to-binary':
      result = hexToBinary(input);
      break;
    case 'decimal-to-binary':
      result = decimalToBinary(input);
      break;
    case 'base64-to-binary':
      result = base64ToBinary(input);
      break;
    case 'binary-to-text':
      result = binaryToText(input);
      break;
    case 'binary-to-ascii':
      result = binaryToAscii(input);
      break;
    case 'binary-to-hex':
      result = binaryToHex(input);
      break;
    case 'binary-to-decimal':
      result = binaryToDecimal(input);
      break;
    case 'binary-to-base64':
      result = binaryToBase64(input);
      break;
    default:
      return NextResponse.json(
        { error: `Unsupported binary mode: ${mode}` },
        { status: 400 }
      );
  }

  return new NextResponse(result, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Content-Disposition': `attachment; filename="${filenameMap[mode]}"`,
    },
  });
}
