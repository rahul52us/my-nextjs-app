import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Fields: file, password
// Returns: encrypted .enc file (prepended with IV + auth tag)
// Format: [16 bytes IV][16 bytes authTag][encrypted content]
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const password = formData.get('password') as string | null;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    if (!password) return NextResponse.json({ error: 'Password is required for encryption' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());

    // Derive 256-bit key from password using PBKDF2
    const salt = crypto.randomBytes(16);
    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    const authTag = cipher.getAuthTag();

    // Layout: [16 salt][16 IV][16 authTag][encrypted]
    const output = Buffer.concat([salt, iv, authTag, encrypted]);

    return new NextResponse(output, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${file.name}.enc"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to encrypt file' }, { status: 500 });
  }
}
