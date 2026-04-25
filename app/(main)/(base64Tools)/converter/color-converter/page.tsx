import type { Metadata } from "next";
import ColorConverterContent from "./content";

export const metadata: Metadata = {
  title: "Color Converter | HEX RGB HSL Converter",
  description: "Convert colors between HEX, RGB, and HSL formats with an online color converter.",
};

export default function ColorConverterPage() {
  return <ColorConverterContent />;
}
