// REVIEWER NOTES BEFORE YOU YELL AT ME:
// Full disclosure: The majority of the HCA implementation is from ChatGPT and Claude Code.
// The HCA integration is not the point of this project, so I don't think this is complete slop.

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { genericOAuth } from "better-auth/plugins";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  baseURL: "http://localhost:3000/",
  user: {
    additionalFields: {
      slackId: {
        type: "string",
        required: false,
      },
      slackUserId: {
        type: "string",
        required: false,
      },
    },
  },
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "hackclub",

          clientId: process.env.HACKCLUB_CLIENT_ID!,
          clientSecret: process.env.HACKCLUB_CLIENT_SECRET!,

          overrideUserInfo: true,

          mapProfileToUser: async (profile) => {
            console.log("info:");
            console.log(profile);
            const slackId = profile.slack_id; // whatever field your OAuth puts it in

            const slackUser = await prisma.slackUser.findUnique({
              where: { id: slackId },
            });

            return {
              slackId,
              slackUserId: slackUser?.id ?? null,
            };
          },

          authorizationUrl: "https://auth.hackclub.com/oauth/authorize",

          tokenUrl: "https://auth.hackclub.com/oauth/token",

          userInfoUrl: "https://auth.hackclub.com/api/v1/me",

          scopes: ["name", "email", "slack_id"],

          responseType: "code",
          pkce: true,

          getUserInfo: async (tokens) => {
            const response = await fetch(
              "https://auth.hackclub.com/api/v1/me",
              {
                headers: {
                  Authorization: `Bearer ${tokens.accessToken}`,
                },
              },
            );

            if (!response.ok) {
              console.error(
                "Hack Club user fetch failed",
                await response.text(),
              );
              return null;
            }

            const data = await response.json();

            console.log("Hack Club profile:", data);

            const identity = data.identity;

            if (!identity?.id) {
              return null;
            }

            // The `slack_id` scope returns the user's Slack ID. Resolve it to
            // their Slack profile picture via Hack Club's cachet service, which
            // caches Slack avatars and 302-redirects to the current image. We
            // store the cachet URL so the avatar stays fresh without a Slack token.
            const slackId =
              data.slack_id ?? identity.slack_id ?? data.slack?.id ?? null;
            const image = slackId
              ? `https://cachet.dunkirk.sh/users/${slackId}/r`
              : undefined;

            return {
              id: identity.id,
              email: identity.primary_email ?? "",
              name: [identity.first_name, identity.last_name]
                .filter(Boolean)
                .join(" "),
              emailVerified: true,
              slack_id: slackId,
              image,
            };
          },
        },
      ],
    }),
  ],
});
