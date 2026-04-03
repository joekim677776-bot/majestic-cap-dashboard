import type { NextAuthConfig } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

export default {
  trustHost: true,
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      authorization: "https://discord.com/api/oauth2/authorize?scope=identify+email",
    }),
  ],
  pages: {
    signIn: "/api/auth/signin",
    error: "/access-denied",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = nextUrl.pathname.startsWith("/api/auth") || nextUrl.pathname.startsWith("/access-denied");

      if (isAuthPage) return true;

      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;
