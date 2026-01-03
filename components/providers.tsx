"use client";

import { SessionProvider, signOut } from "next-auth/react";
import { ReactNode, useEffect } from "react";
import { setOnUnauthorizedHandler } from "@/lib/api";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    // Set up global handler for unauthorized API responses
    setOnUnauthorizedHandler(() => {
      // Sign out the user when an unauthorized response is received
      signOut({ callbackUrl: "/login" });
    });
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
}
