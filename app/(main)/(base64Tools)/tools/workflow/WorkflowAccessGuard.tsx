"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AUTH_TOKEN } from "../../../../config/utils/variables";

type WorkflowAccessGuardProps = {
  children: ReactNode;
};

export default function WorkflowAccessGuard({ children }: WorkflowAccessGuardProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  const hasToken = () => {
    if (typeof window === "undefined") return false;
    const tokenKey = AUTH_TOKEN || "auth_token";
    const token = localStorage.getItem(tokenKey);
    return Boolean(token);
  };

  useEffect(() => {
    if (!hasToken()) {
      setIsAuthorized(false);
      router.replace("/login");
      return;
    }
    setIsAuthorized(true);
  }, [router]);

  if (!isAuthorized) return null;

  return <>{children}</>;
}
