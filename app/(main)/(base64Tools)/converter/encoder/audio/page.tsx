import type { Metadata } from 'next';
import AudioToBase64Content from './content';

export const metadata: Metadata = {
  title: 'Audio to Base64 Encoder | Convert MP3/WAV to Base64',
  description: 'Convert audio files (MP3, WAV, etc.) to Base64 encoded strings. Useful for embedding audio in HTML or CSS.',
};

export default function AudioToBase64Page() {
  return <AudioToBase64Content />;
}
