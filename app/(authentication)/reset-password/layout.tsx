import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | Toolsahayata",
  description:
    "Securely reset your Toolsahayata password and regain access to your account.",
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}