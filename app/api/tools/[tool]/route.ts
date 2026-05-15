import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tool: string }> }
) {
  const resolvedParams = await params;
  const tool = resolvedParams.tool?.toLowerCase();
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json(
      { error: 'No file provided. Please upload a file under the "file" field.' },
      { status: 400 }
    );
  }

  if (!tool) {
    return NextResponse.json(
      { error: 'Tool slug is missing from the request path.' },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      error: `The API route for tool '${tool}' exists, but this tool is not implemented on the server yet.`,
      detail: 'Create a specific route implementation under app/api/tools or add support in app/api/tools/[tool]/route.ts.',
    },
    { status: 501 }
  );
}
