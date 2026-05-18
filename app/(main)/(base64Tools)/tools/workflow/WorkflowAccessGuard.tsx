"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AUTH_TOKEN } from "../../../../config/utils/variables";

export default function WorkflowAccessGuard() {
  const router = useRouter();

  useEffect(() => {
    const tokenKey = AUTH_TOKEN || "auth_token";
    const token = typeof window !== "undefined" ? localStorage.getItem(tokenKey) : null;
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  return null;
}
