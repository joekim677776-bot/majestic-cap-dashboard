import NextAuth from "next-auth";
import prisma from "@/lib/prisma";
import authConfig from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ account, profile }) {
      if (!account || account.provider !== "discord" || !profile) return false;

      const discordId = profile.id as string;
      const guildId = process.env.DISCORD_GUILD_ID;
      const botToken = process.env.DISCORD_BOT_TOKEN;
      const requiredRoleIds = process.env.DISCORD_REQUIRED_ROLE_IDS?.split(",") ?? [];

      if (!guildId || !botToken || requiredRoleIds.length === 0) {
        console.error("Missing Discord verification environment variables.");
        return false;
      }

      try {
        // Check guild membership and roles using Discord Bot API
        const response = await fetch(
          `https://discord.com/api/v10/guilds/${guildId}/members/${discordId}`,
          {
            headers: {
              Authorization: `Bot ${botToken}`,
            },
          }
        );

        if (!response.ok) {
          console.error(`Discord API error: ${response.status} ${response.statusText}`);
          return "/access-denied";
        }

        const member = await response.json();
        const userRoles = (member.roles as string[]) || [];

        const hasAccess = userRoles.some((roleId) => requiredRoleIds.includes(roleId));

        if (!hasAccess) {
          console.warn(`User ${discordId} does not have any of the required roles.`);
          return "/access-denied";
        }

        // If authorized, upsert player record
        await prisma.player.upsert({
          where: { discordId },
          update: {
            discordName: (profile.global_name as string) || (profile.username as string),
            discordAvatar: profile.image_url as string,
          },
          create: {
            discordId,
            discordName: (profile.global_name as string) || (profile.username as string),
            discordAvatar: profile.image_url as string,
          },
        });

        return true;
      } catch (error) {
        console.error("Error during Discord verification:", error);
        return "/access-denied";
      }
    },
    async jwt({ token, account, profile }) {
      // On first sign-in, store the Prisma player id in the token
      if (account && profile) {
        const discordId = profile.id as string;
        const player = await prisma.player.findUnique({
          where: { discordId },
          select: { id: true },
        });
        if (player) token.playerId = player.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Use the Prisma player id as session.user.id
        session.user.id = (token.playerId as string) ?? token.sub ?? "";
      }
      return session;
    },
  },
});
