import { NextAuthOptions } from "next-auth";
import LineProvider from "next-auth/providers/line";
import CredentialsProvider from "next-auth/providers/credentials";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      image?: string | null;
      role: "USER" | "REVIEWER" | "ADMIN";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "USER" | "REVIEWER" | "ADMIN";
  }
}

const isHttps = process.env.NEXTAUTH_URL?.startsWith("https://");

const providers: any[] = [
  LineProvider({
    clientId: process.env.LINE_CLIENT_ID as string,
    clientSecret: process.env.LINE_CLIENT_SECRET as string,
    authorization: { params: { scope: "profile openid" } },
    client: {
      id_token_signed_response_alg: "HS256",
      token_endpoint_auth_method: "client_secret_post",
    },
  }),
];

// 🚀 [DEVELOPMENT ONLY] Bypass Auth Provider
if (process.env.NODE_ENV === "development") {
  providers.push(
    CredentialsProvider({
      id: "credentials",
      name: "Bypass Auth",
      credentials: {
        bypassRole: { label: "Bypass Role", type: "text" },
      },
      async authorize(credentials) {
        console.log("[Bypass] Authorize started with credentials:", credentials);
        if (!credentials?.bypassRole) {
           console.log("[Bypass] bypassRole is empty!");
           return null;
        }

        const role = credentials.bypassRole.toUpperCase();
        
        // Mock user data
        const mockUser = {
          id: `mock-${role.toLowerCase()}`,
          name: `Bypass ${role}`,
          image: `https://ui-avatars.com/api/?name=Bypass+${role}&background=random`,
          dbId: `mock-${role.toLowerCase()}`,
          role: role,
          isBypass: true,
        };

        try {
          // Attempt to sync with backend to ensure the user exists in DB
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8787/api"}/users/sync`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                lineUserId: mockUser.id,
                displayName: mockUser.name,
                pictureUrl: mockUser.image,
              }),
            }
          );
          
          if (res.ok) {
            const data = await res.json();
            if (data.status === "success" && data.data) {
              mockUser.id = data.data.id;
              mockUser.dbId = data.data.id;
            }
          }
        } catch (e) {
          console.error("[Bypass] Backend sync failed, but proceeding with mock user anyway:", e);
        }

        console.log("[Bypass] Returning user:", mockUser);
        return mockUser as any;
      },
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      // Allow bypass provider
      if (account?.provider === "bypass" || account?.type === "credentials") return true;

      if (account?.provider === "line") {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8787/api"}/users/sync`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                lineUserId: account.providerAccountId,
                displayName: user.name,
                pictureUrl: user.image,
              }),
            },
          );

          if (!res.ok) return false;

          const data = await res.json();
          if (data.status === "success" && data.data) {
            (user as any).dbId = data.data.id;
            (user as any).role = data.data.role;
            return true;
          }
        } catch (error) {
          console.error("Failed to sync LINE user with database:", error);
          return false;
        }
      }
      return false;
    },

    async jwt({ token, user }) {
      // Set initial token attributes on login
      if (user) {
        token.id = (user as any).dbId;
        token.role = (user as any).role;
        token.name = user.name;
        token.picture = user.image;
        if ((user as any).isBypass) {
          token.isBypass = true;
        }
      }

      // Re-fetch latest role & info live from backend DB on every session check!
      if (token.id) {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8787/api"}/users/${token.id}`,
            {
              headers: {
                "x-user-id": token.id as string,
                "x-user-role": (token.role as string) || "USER",
              },
              cache: "no-store",
            },
          );

          if (res.ok) {
            const data = await res.json();
            if (data.status === "success" && data.data) {
              // Only override role if NOT a bypass user, or if we want bypass users to stay as they were mocked
              if (!token.isBypass) {
                token.role = data.data.role;
              }
              if (data.data.displayName) token.name = data.data.displayName;
              if (data.data.pictureUrl) token.picture = data.data.pictureUrl;
            }
          }
        } catch (e) {
          // Fallback to token cache if offline
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as any) || "USER";
        if (token.name) session.user.name = token.name;
        if (token.picture) session.user.image = token.picture as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  useSecureCookies: isHttps,
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_development_only",
  debug: true,
};
