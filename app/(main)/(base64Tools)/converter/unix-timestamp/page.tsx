import type { Metadata } from "next";
import UnixTimestampContent from "./content";

export const metadata: Metadata = {
  title: "Unix Timestamp Converter | Convert Timestamps to Date/Time",
  description:
    "Convert Unix timestamps to readable date/time and back using an online timestamp converter.",
};

export default function UnixTimestampPage() {
  return <UnixTimestampContent />;
}
