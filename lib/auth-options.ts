import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { apiClient, setAuthToken } from "@/lib/api";
import type { AuthResponse } from "@/lib/api";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        try {
          const response: AuthResponse = await apiClient.login(
            credentials.email,
            credentials.password
          );

          const token = response.accessToken || response.token;
          const refreshToken = response.refreshToken;
          const projectId = response.projectId;

          if (token && response.user) {
            setAuthToken(token);
            return {
              id: response.user.id,
              email: response.user.email,
              name: response.user.name,
              accessToken: token,
              refreshToken: refreshToken,
              projectId: projectId,
              isAdmin: response.user.isAdmin || false,
              role: response.user.role || "owner",
              hasActiveSubscription:
                response.user.hasActiveSubscription || false,
              subscriptionStatus: response.user.subscriptionStatus || "none",
              emailVerified: response.user.emailVerified ?? true,
            };
          }

          throw new Error("Invalid response from server");
        } catch (error: any) {
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Handle Google OAuth sign-in
      if (account?.provider === "google" && user?.email) {
        try {
          // Call our backend to authenticate with Google
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"}/api/auth/google`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ idToken: account.id_token }),
            }
          );

          if (!response.ok) {
            return false;
          }

          const data = await response.json();
          
          // Store the tokens in the user object for the jwt callback
          (user as any).accessToken = data.accessToken;
          (user as any).refreshToken = data.refreshToken;
          (user as any).projectId = data.projectId;
          (user as any).isAdmin = data.user?.isAdmin || false;
          (user as any).role = data.user?.role || "owner";
          (user as any).hasActiveSubscription = data.user?.hasActiveSubscription || false;
          (user as any).subscriptionStatus = data.user?.subscriptionStatus || "none";
          (user as any).emailVerified = true; // Google accounts are always verified
          (user as any).id = data.user?.id;

          return true;
        } catch {
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger }) {
      if (user && (user as any).accessToken) {
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        token.projectId = (user as any).projectId;
        token.isAdmin = (user as any).isAdmin;
        token.role = (user as any).role;
        token.hasActiveSubscription = (user as any).hasActiveSubscription;
        token.subscriptionStatus = (user as any).subscriptionStatus;
        token.emailVerified = (user as any).emailVerified ?? true;
        // Store user ID in token.sub (NextAuth standard)
        token.sub = (user as any).id || user.id;
      }

      if (trigger === "update" && token.accessToken) {
        try {
          const response = await fetch(
            `${
              process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"
            }/api/v1/me`,
            {
              headers: {
                Authorization: `Bearer ${token.accessToken}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            token.hasActiveSubscription = data.hasActiveSubscription;
            token.subscriptionStatus = data.subscriptionStatus;
            token.projectId = data.projectId || token.projectId;
          }
        } catch {
          // Silent fail - token refresh will retry
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token.accessToken) {
        session.accessToken = token.accessToken;
        session.refreshToken = token.refreshToken;
        session.projectId = token.projectId;
        session.isAdmin = token.isAdmin as boolean;
        session.role = token.role as string;
        session.hasActiveSubscription = token.hasActiveSubscription as boolean;
        session.subscriptionStatus = token.subscriptionStatus as string;
        session.emailVerified = token.emailVerified as boolean;
        // IMPORTANT: Set the user ID in session.user
        if (token.sub) {
          session.user.id = token.sub;
        }
        // Set the token in the API client
        setAuthToken(token.accessToken as string);
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};
