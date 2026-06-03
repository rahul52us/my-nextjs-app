import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    let profileData: any;
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      profileData = body.data ?? body;
    } else {
      const formData = await request.formData();
      const text = formData.get('text') as string | null;
      if (text) {
        profileData = JSON.parse(text);
      } else {
        profileData = { name: 'John Doe', title: 'Software Engineer', experience: '5 years' };
      }
    }

    // Generate a simple text-based resume layout that is compatible with downstream text/pdf operations.
    const cvText = `
========================================
RESUME
========================================
Name: ${profileData.name || 'N/A'}
Title: ${profileData.title || 'N/A'}
Contact: ${profileData.email || 'N/A'} | ${profileData.phone || 'N/A'}
Experience: ${profileData.experience || 'N/A'}
Skills: ${profileData.skills || 'N/A'}
========================================
    `.trim();

    return new NextResponse(cvText, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
        'Content-Disposition': 'attachment; filename="cv.txt"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
