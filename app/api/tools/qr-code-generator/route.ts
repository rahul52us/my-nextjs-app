import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function POST(request: NextRequest) {
  try {
    const { text, size = 300, format = 'image/png', errorCorrection = 'M' } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided for QR code' }, { status: 400 });
    }

    const supportedFormats = ['image/png', 'image/jpeg', 'image/webp'];
    if (!supportedFormats.includes(format)) {
      return NextResponse.json(
        { error: 'Unsupported format. Supported: image/png, image/jpeg, image/webp' },
        { status: 400 }
      );
    }

    const qrCodeDataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: errorCorrection,
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Extract base64 from data URL
    const base64 = qrCodeDataUrl.split(',')[1];

    return NextResponse.json({
      success: true,
      qrCode: base64,
      format,
      size,
      text,
      dataUrl: qrCodeDataUrl
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const text = searchParams.get('text');
    const size = parseInt(searchParams.get('size') || '300');
    const errorCorrection = searchParams.get('errorCorrection') || 'M';

    if (!text) {
      return NextResponse.json({ error: 'No text provided for QR code' }, { status: 400 });
    }

    const qrCodeDataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: errorCorrection,
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    const base64 = qrCodeDataUrl.split(',')[1];
    const buffer = Buffer.from(base64, 'base64');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'inline; filename="qrcode.png"'
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}
