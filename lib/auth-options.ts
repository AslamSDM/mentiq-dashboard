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
          return null;
        }

        try {
          console.log("Attempting login with:", credentials.email);
          const response: AuthResponse = await apiClient.login(
            credentials.email,
            credentials.password
          );

          console.log("Login response:", response);

          if (response.token && response.user) {
            console.log("Login successful, setting token");
            // Set the token immediately in the API client
            setAuthToken(response.token);

            return {
              id: response.user.id,
              email: response.user.email,
              name: response.user.name,
              accessToken: response.token,
            };
          }
          return null;
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && user.accessToken) {
        console.log("JWT callback: Setting accessToken in token");
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.accessToken) {
        console.log("Session callback: Setting accessToken in session");
        session.accessToken = token.accessToken;
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
};
