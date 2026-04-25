import type { Metadata } from "next";
import JwtDecoderContent from "./content";

export const metadata: Metadata = {
  title: "JWT Decoder | Decode JSON Web Tokens Online",
  description:
    "Decode JWT tokens instantly and inspect header, payload, and signature data. Free online JWT decoder tool.",
};

export default function JwtDecoderPage() {
  return <JwtDecoderContent />;
}
