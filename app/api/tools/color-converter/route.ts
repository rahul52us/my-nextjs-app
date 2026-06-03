import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { value, toFormat } = body; // toFormat: 'hex', 'rgb', 'hsl'

    if (!value || !toFormat) {
      return NextResponse.json({ error: 'Provide value and toFormat fields' }, { status: 400 });
    }

    // Helper: HEX to RGB
    const hexToRgb = (hex: string) => {
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    let rgb = { r: 0, g: 0, b: 0 };
    if (value.startsWith('#')) {
      const parsed = hexToRgb(value);
      if (parsed) rgb = parsed;
    } else if (value.startsWith('rgb')) {
      const matches = value.match(/\d+/g);
      if (matches && matches.length >= 3) {
        rgb = { r: parseInt(matches[0]), g: parseInt(matches[1]), b: parseInt(matches[2]) };
      }
    }

    if (toFormat === 'rgb') {
      return NextResponse.json({ result: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` });
    } else if (toFormat === 'hex') {
      const componentToHex = (c: number) => {
        const hex = c.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
      return NextResponse.json({ result: `#${componentToHex(rgb.r)}${componentToHex(rgb.g)}${componentToHex(rgb.b)}`.toUpperCase() });
    }

    return NextResponse.json({ error: 'Unsupported format conversion' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
