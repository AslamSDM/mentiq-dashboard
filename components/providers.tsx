"use client";

import { SessionProvider, signOut, useSession } from "next-auth/react";
import { ReactNode, useEffect } from "react";
import { setOnUnauthorizedHandler, setAuthToken } from "@/lib/api";

interface ProvidersProps {
  children: ReactNode;
}

function AuthTokenSync() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      setAuthToken(session.accessToken as string);
    } else if (status === "unauthenticated") {
      setAuthToken(null);
    }
  }, [status, session?.accessToken]);

  return null;
}

export function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    setOnUnauthorizedHandler(() => {
      signOut({ callbackUrl: "/signin" });
    });
  }, []);

  return (
    <SessionProvider>
      <AuthTokenSync />
      {children}
    </SessionProvider>
  );
}
