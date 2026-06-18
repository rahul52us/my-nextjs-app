import type { Metadata } from "next";
import ForgotPasswordContent from "./content";

export const metadata: Metadata = {
  title: "Forgot Password | Toolsahayata",
  description:
    "Reset your Toolsahayata password by entering your email address.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordContent />;
}