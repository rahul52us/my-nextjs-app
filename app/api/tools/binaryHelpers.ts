import { NextRequest } from 'next/server';
import { Buffer } from 'buffer';

export async function getTextInput(request: NextRequest): Promise<string> {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const body = await request.json();
    return (body.text || body.input || body.data || body.source || body.value || '').toString();
  }

  const formData = await request.formData();
  const textFields = ['text', 'input', 'binary', 'ascii', 'hex', 'decimal', 'base64', 'data'];

  for (const field of textFields) {
    const value = formData.get(field);
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  const file = formData.get('file') as File | null;
  if (file) {
    return await file.text();
  }

  return '';
}

export function normalizeBinaryString(binary: string): string[] {
  return binary
    .replace(/[^01\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export function textToBinary(text: string): string {
  return text
    .split('')
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join(' ');
}

export function hexToBinary(hex: string): string {
  const cleaned = hex.replace(/[^0-9a-fA-F]/g, '');
  return cleaned
    .match(/.{1,2}/g)
    ?.map((pair) => parseInt(pair, 16).toString(2).padStart(8, '0'))
    .join(' ') || '';
}

export function decimalToBinary(decimal: string): string {
  return decimal
    .split(/[\s,;]+/)
    .filter(Boolean)
    .map((value) => Number(value))
    .map((num) => Number.isNaN(num) ? '' : num.toString(2))
    .filter(Boolean)
    .join(' ');
}

export function fileToBinary(buffer: Buffer): string {
  return Array.from(buffer)
    .map((byte) => byte.toString(2).padStart(8, '0'))
    .join(' ');
}

export function base64ToBinary(base64: string): string {
  try {
    const buffer = Buffer.from(base64.trim(), 'base64');
    return fileToBinary(buffer);
  } catch {
    return '';
  }
}

export function binaryToText(binary: string): string {
  const bytes = normalizeBinaryString(binary);
  return bytes
    .map((byte) => String.fromCharCode(parseInt(byte, 2)))
    .join('');
}

export function binaryToAscii(binary: string): string {
  return binaryToText(binary);
}

export function binaryToDecimal(binary: string): string {
  const bytes = normalizeBinaryString(binary);
  return bytes.map((byte) => parseInt(byte, 2).toString(10)).join(' ');
}

export function binaryToHex(binary: string): string {
  const bytes = normalizeBinaryString(binary);
  return bytes
    .map((byte) => parseInt(byte, 2).toString(16).padStart(2, '0'))
    .join(' ');
}

export function binaryToBase64(binary: string): string {
  const bytes = normalizeBinaryString(binary).map((byte) => parseInt(byte, 2));
  try {
    return Buffer.from(bytes).toString('base64');
  } catch {
    return '';
  }
}

export function binaryToFile(binary: string): Buffer {
  const bytes = normalizeBinaryString(binary).map((byte) => parseInt(byte, 2));
  return Buffer.from(bytes);
}
