import type { Metadata } from 'next';
import ToolContent from './content';

export const metadata: Metadata = {
  title: "Barcode Generator | Create & Download Barcodes Online",
  description: "Generate custom barcodes online instantly. Download high-quality PNG barcode images for products and inventory.",
};

export default function Page() {
  return <ToolContent />;
}
