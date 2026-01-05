"use client";

import { useSession } from "next-auth/react";

// Loading spinner for when checking auth
// Note: Authenticated users are now redirected server-side via middleware,
// so this component just needs to handle the loading state
export function AuthLoadingCheck({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  // Show loading only briefly - middleware handles authenticated redirects
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F4F7FE]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  // For authenticated users, show a brief redirect message
  // (middleware should redirect before this is seen, but just in case)
  if (status === "authenticated") {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F4F7FE]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-[#4363C7]">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// AuthRedirect is no longer needed since middleware handles redirects
// Keeping this export for backwards compatibility
export function AuthRedirect() {
  return null;
}
