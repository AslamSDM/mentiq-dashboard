import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { apiClient, setAuthToken } from "@/lib/api";
import type { AuthResponse } from "@/lib/api";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("Missing email or password");
          throw new Error("Missing email or password");
        }

        try {
          console.log("Attempting login with:", credentials.email);
          const response: AuthResponse = await apiClient.login(
            credentials.email,
            credentials.password
          );

          console.log("Login response:", JSON.stringify(response, null, 2));

          // Support both old (token) and new (accessToken) formats
          const token = response.accessToken || response.token;
          const refreshToken = response.refreshToken;
          const projectId = response.projectId;

          if (token && response.user) {
            console.log("Login successful, setting token");
            // Set the token immediately in the API client
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
            };
          }

          console.error("Invalid response format - missing token or user");
          throw new Error("Invalid response from server");
        } catch (error: any) {
          console.error("Authentication error:", error.message || error);
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Initial sign in
      if (user && user.accessToken) {
        console.log("JWT callback: Setting accessToken in token");
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.projectId = user.projectId;
        token.isAdmin = user.isAdmin;
        token.role = user.role;
        token.hasActiveSubscription = user.hasActiveSubscription;
        token.subscriptionStatus = user.subscriptionStatus;
        // Store user ID in token.sub (NextAuth standard)
        token.sub = user.id;
      }

      // Manual session update - refetch subscription status from backend
      if (trigger === "update" && token.accessToken) {
        console.log(
          "JWT callback: Refetching subscription status from backend"
        );
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
            console.log("JWT callback: Updated subscription status:", {
              hasActiveSubscription: data.hasActiveSubscription,
              subscriptionStatus: data.subscriptionStatus,
            });
            token.hasActiveSubscription = data.hasActiveSubscription;
            token.subscriptionStatus = data.subscriptionStatus;
            token.projectId = data.projectId || token.projectId;
          }
        } catch (error) {
          console.error("JWT callback: Error refetching subscription:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token.accessToken) {
        console.log("Session callback: Setting accessToken in session");
        session.accessToken = token.accessToken;
        session.refreshToken = token.refreshToken;
        session.projectId = token.projectId;
        session.isAdmin = token.isAdmin as boolean;
        session.role = token.role as string;
        session.hasActiveSubscription = token.hasActiveSubscription as boolean;
        session.subscriptionStatus = token.subscriptionStatus as string;
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
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
