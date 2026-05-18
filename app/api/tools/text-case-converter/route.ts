import { NextRequest, NextResponse } from 'next/server';

function normalizeMode(value: string): string {
  const mode = value?.toString().trim().toLowerCase();
  if (!mode) return "";

  if (mode === "upper" || mode === "uppercase") return "upper";
  if (mode === "lower" || mode === "lowercase") return "lower";
  if (mode === "title" || mode === "titlecase" || mode === "title-case") return "title";
  if (mode === "sentence" || mode === "sentencecase" || mode === "sentence-case") return "sentence";
  if (mode === "toggle" || mode === "togglecase" || mode === "toggle-case") return "toggle";

  return mode;
}

function toTitleCase(text: string): string {
  return text.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

function toSentenceCase(text: string): string {
  return text
    .toLowerCase()
    .replace(/(^|[.!?]\s+)([a-z])/g, (_, prefix, char) => `${prefix}${char.toUpperCase()}`);
}

function toToggleCase(text: string): string {
  return text
    .split("")
    .map((char) => (char === char.toLowerCase() ? char.toUpperCase() : char.toLowerCase()))
    .join("");
}

async function getTextFromFormData(formData: FormData): Promise<string> {
  const fields = ["text", "input", "value", "data", "source"]; 
  for (const field of fields) {
    const value = formData.get(field);
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  const file = formData.get("file") as File | null;
  if (file) {
    return await file.text();
  }

  return "";
}

function transformText(text: string, mode: string): string {
  switch (mode) {
    case "upper":
      return text.toUpperCase();
    case "lower":
      return text.toLowerCase();
    case "title":
      return toTitleCase(text);
    case "sentence":
      return toSentenceCase(text);
    case "toggle":
      return toToggleCase(text);
    default:
      return text;
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const contentType = request.headers.get("content-type") || "";
    let mode = "";
    let text = "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      mode = normalizeMode((body.mode || body.case || body.type || "").toString());
      text = (body.text || body.input || body.value || body.data || body.source || "").toString();
    } else {
      const formData = await request.formData();
      mode = normalizeMode(((formData.get("mode") as string) || (formData.get("case") as string) || (formData.get("type") as string) || "").toString());
      text = await getTextFromFormData(formData);
    }

    if (!text.trim()) {
      return NextResponse.json(
        { error: "Provide text input or upload a text file for conversion." },
        { status: 400 }
      );
    }

    if (!mode) {
      mode = "lower";
    }

    const output = transformText(text, mode);

    return new NextResponse(output, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": "attachment; filename=\"text-case-converter.txt\"",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to convert text case." },
      { status: 500 }
    );
  }
}
