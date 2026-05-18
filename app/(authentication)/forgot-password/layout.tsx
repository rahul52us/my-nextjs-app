// app/(authentication)/forgot-password/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | Toolsahayata",
  description:
    "Reset your Toolsahayata password by receiving a secure reset link via email.",
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}