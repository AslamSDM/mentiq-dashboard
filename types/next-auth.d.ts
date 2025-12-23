import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string;
    refreshToken?: string;
    projectId?: string;
    isAdmin?: boolean;
    role?: string;
    hasActiveSubscription?: boolean;
    subscriptionStatus?: string;
    emailVerified?: boolean;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    accessToken?: string;
    refreshToken?: string;
    projectId?: string;
    isAdmin?: boolean;
    role?: string;
    hasActiveSubscription?: boolean;
    subscriptionStatus?: string;
    emailVerified?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    projectId?: string;
    isAdmin?: boolean;
    role?: string;
    hasActiveSubscription?: boolean;
    subscriptionStatus?: string;
    emailVerified?: boolean;
  }
}
