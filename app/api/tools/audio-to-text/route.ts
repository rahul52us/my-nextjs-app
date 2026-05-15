import { NextRequest, NextResponse } from 'next/server';
import FormData from 'form-data';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const language = formData.get('language') as string || 'en';

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const supportedFormats = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/flac'];
    if (!supportedFormats.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported audio format. Supported: MP3, WAV, OGG, WebM, FLAC' },
        { status: 400 }
      );
    }

    // Check file size (max 25MB for most APIs)
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 25MB limit' },
        { status: 400 }
      );
    }

    // Note: This is a template for speech-to-text API integration
    // You need to integrate with a service like Google Cloud Speech-to-Text, Azure Speech, or OpenAI Whisper

    // Example with OpenAI Whisper (requires OPENAI_API_KEY)
    if (process.env.OPENAI_API_KEY) {
      const audioFormData = new FormData();
      const buffer = await file.arrayBuffer();
      audioFormData.append('file', Buffer.from(buffer), file.name);
      audioFormData.append('model', 'whisper-1');
      audioFormData.append('language', language);

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: audioFormData as any
      });

      if (!response.ok) {
        throw new Error('Failed to transcribe audio with OpenAI Whisper');
      }

      const result = await response.json();

      return NextResponse.json({
        success: true,
        text: result.text,
        fileName: file.name,
        duration: file.size / 16000 // Approximate duration
      });
    }

    // Fallback: Return placeholder response
    return NextResponse.json({
      success: false,
      error: 'Audio transcription service not configured. Please set OPENAI_API_KEY or configure another speech-to-text service',
      fileName: file.name
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}
