import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    let data: any[];
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      data = body.data ?? body;
    } else {
      const formData = await request.formData();
      const text = formData.get('text') as string | null;
      if (text) {
        data = JSON.parse(text);
      } else {
        data = [10, 20, 30, 40, 50];
      }
    }

    if (!Array.isArray(data)) {
      data = [data];
    }

    // Generate a simple vector SVG chart representing the data array visually
    const width = 500;
    const height = 300;
    const padding = 40;
    
    // Normalize data to chart height
    const numbers = data.map(val => typeof val === 'number' ? val : parseFloat(val) || 0);
    const maxVal = Math.max(...numbers, 1);
    const chartHeight = height - padding * 2;
    const chartWidth = width - padding * 2;
    const barWidth = chartWidth / numbers.length - 10;

    let barsSvg = '';
    numbers.forEach((num, index) => {
      const barHeight = (num / maxVal) * chartHeight;
      const x = padding + index * (barWidth + 10);
      const y = height - padding - barHeight;
      barsSvg += `
        <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="#4299E1" rx="4"/>
        <text x="${x + barWidth / 2}" y="${height - padding + 20}" font-family="sans-serif" font-size="10" text-anchor="middle" fill="#718096">${index + 1}</text>
        <text x="${x + barWidth / 2}" y="${y - 8}" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle" fill="#2D3748">${num}</text>
      `;
    });

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <rect width="100%" height="100%" fill="#F7FAFC" rx="12"/>
        <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#E2E8F0" stroke-width="2"/>
        ${barsSvg}
      </svg>
    `.trim();

    return new NextResponse(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': 'attachment; filename="chart.svg"',
      },
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
