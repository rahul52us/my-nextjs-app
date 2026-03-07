import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { fileData, fileType, userQuery, isImage } = await req.json();
    const apiKey = process.env.GOOGLE_API_KEY;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    // BEAUTIFUL SYSTEM PROMPT
    const systemPrompt = `You are a world-class Document AI. 
    1. If the user asks for a summary, provide a beautiful, bulleted summary.
    2. If the context is an Excel/CSV (JSON format), explain trends or data points.
    3. If the context is an image, describe visual details accurately.
    4. Keep answers clean, professional, and friendly.
    
    CONTEXT DATA: ${isImage ? "[Analyzing Image]" : fileData.slice(0, 40000)}`;

    let body;
    if (isImage) {
      body = {
        contents: [{
          parts: [
            { text: `${systemPrompt}\n\nUSER QUESTION: ${userQuery}` },
            { inline_data: { mime_type: fileType, data: fileData } }
          ]
        }]
      };
    } else {
      body = {
        contents: [{
          parts: [{ text: `${systemPrompt}\n\nUSER QUESTION: ${userQuery}` }]
        }]
      };
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that request.";
    
    return NextResponse.json({ reply: botReply });
  } catch (error) {
    return NextResponse.json({ error: "API Failure" }, { status: 500 });
  }
}