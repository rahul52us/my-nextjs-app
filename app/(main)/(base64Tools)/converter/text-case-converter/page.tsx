import type { Metadata } from "next";
import TextCaseConverterContent from "./content";

export const metadata: Metadata = {
  title: "Text Case Converter | Change Text Case Online",
  description: "Convert text between uppercase, lowercase, title case, sentence case and more.",
};

export default function TextCaseConverterPage() {
  return <TextCaseConverterContent />;
}
