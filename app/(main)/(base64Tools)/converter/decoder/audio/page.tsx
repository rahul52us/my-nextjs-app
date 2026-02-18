import type { Metadata } from 'next';
import Base64ToAudioContent from './content';

export const metadata: Metadata = {
  title: 'Base64 to Audio Converter | Play & Download Base64 Audio',
  description: 'Convert Base64 encoded audio strings back to playable audio files (MP3, WAV, etc.) instantly in your browser.',
};

export default function Base64ToAudioPage() {
  return <Base64ToAudioContent />;
}
