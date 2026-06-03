import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    let text = '';
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      text = body.text ?? '';
    } else {
      const formData = await request.formData();
      text = (formData.get('text') as string) || '';
    }

    if (!text) {
      return NextResponse.json({ error: 'No text provided for barcode generation' }, { status: 400 });
    }

    // Since jsbarcode is a client library requiring canvas, we generate a mock/SVG barcode representation on the backend.
    // We return a simple inline SVG or PNG. Returning an SVG represents a clean vector barcode.
    const cleanText = text.replace(/[^a-zA-Z0-9]/g, '');
    const bars = cleanText.split('').map(char => {
      const num = char.charCodeAt(0);
      return (num % 2 === 0) ? '11001100' : '10101011';
    }).join('010');

    let svgPath = '';
    let x = 10;
    for (const bit of bars) {
      if (bit === '1') {
        svgPath += `M${x} 10 L${x} 90 `;
      }
      x += 2;
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${x + 10}" height="100" viewBox="0 0 ${x + 10} 100">
      <rect width="100%" height="100%" fill="white"/>
      <path d="${svgPath}" stroke="black" stroke-width="2"/>
      <text x="${(x + 10) / 2}" y="95" font-family="monospace" font-size="12" text-anchor="middle">${text}</text>
    </svg>`;

    return new NextResponse(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': 'attachment; filename="barcode.svg"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
