import type { Metadata } from "next";
import ResetPasswordContent from "./content";

export const metadata: Metadata = {
  title: "Reset Password | Toolsahayata",
  description:
    "Create a new password for your Toolsahayata account.",
};

export default function ResetPasswordPage() {
  return <ResetPasswordContent />;
}