// REVIEWER NOTES BEFORE YOU YELL AT ME:
// Full disclosure: The majority of the HCA implementation is from ChatGPT and Claude Code.
// The HCA integration is not the point of this project, so I don't think this is complete slop.

import { betterAuth, type User } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { genericOAuth } from "better-auth/plugins";
import { prisma } from "./prisma";
import { createUser } from "./slack";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  baseURL: process.env["BETTER_AUTH_URL"],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  account: {
    accountLinking: {
      allowDifferentEmails: true,
    },
    encryptOAuthTokens: true,
  },
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
  databaseHooks: {
    user: {
      create: {
        // Bootstrap the first-ever user as an admin. This runs *after* the
        // row is inserted, so the first registrant sees a total count of 1.
        // We deliberately do NOT expose `isAdmin` as an input field (which
        // would let anyone self-register as admin); we flip it here instead.
        after: async (user) => {
          const userCount = await prisma.user.count();
          if (userCount === 1) {
            await prisma.user.update({
              where: { id: user.id },
              data: { isAdmin: true },
            });
          }
        },
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
            const slackId = profile.slack_id; // whatever field your OAuth puts it in

            const user = await createUser(profile.slack_id);
            // `slackId` and `slackUserId` are declared in `user.additionalFields`
            // above and are persisted at runtime, but better-auth types this
            // return as `Partial<User>` (base fields only), hence the assertion.
            return {
              slackId,
              slackUserId: user?.id ?? null,
              name: user?.username ?? "user",
            } as Partial<User>;
          },

          authorizationUrl: "https://auth.hackclub.com/oauth/authorize",

          tokenUrl: "https://auth.hackclub.com/oauth/token",

          userInfoUrl: "https://auth.hackclub.com/api/v1/me",

          scopes: ["email", "slack_id"],

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
              name: [identity.username].filter(Boolean).join(" "),
              emailVerified: true,
              slack_id: slackId,
              image,
            };
          },
        },
        {
          // This was coded by AI

          // Slack "Add to Slack" v2 OAuth flow. Unlike the built-in `slack()`
          // helper (which uses OpenID Connect and can't grant chat scopes), this
          // requests a user token (xoxp) with chat:write so Unified Help can post
          // replies as the linked user's real Slack account. The token is stored
          // (encrypted at rest) on the user's `account` row and retrieved at
          // reply time via `auth.api.getAccessToken`.
          providerId: "slack",

          clientId: process.env["SLACK_CLIENT_ID"]!,
          clientSecret: process.env["SLACK_CLIENT_SECRET"]!,

          authorizationUrl: "https://slack.com/oauth/v2/authorize",
          tokenUrl: "https://slack.com/api/oauth.v2.access",

          scopes: [],

          responseType: "code",

          // Lock the authorization to the Hack Club workspace so users can't
          // accidentally link a Slack account from another workspace, and
          // request chat:write as a *user* scope (user_scope) so Slack grants
          // a user token (xoxp) under authed_user.access_token, not a bot token.
          // The `scope` param (bot scopes) is left empty via scopes: [] above.
          authorizationUrlParams: {
            ...(process.env["HACKCLUB_TEAM_ID"]
              ? { team: process.env["HACKCLUB_TEAM_ID"] }
              : {}),
            user_scope: "chat:write",
          },

          disableSignUp: true,

          // Slack's v2 token response nests the user token under
          // `authed_user.access_token` instead of the top-level `access_token`,
          // so we provide a custom exchange.
          getToken: async ({ code, redirectURI }) => {
            const clientId = process.env["SLACK_CLIENT_ID"];
            const clientSecret = process.env["SLACK_CLIENT_SECRET"];
            if (!clientId || !clientSecret) {
              throw new Error(
                "SLACK_CLIENT_ID and SLACK_CLIENT_SECRET must be set to link Slack accounts.",
              );
            }
            const resp = await fetch(
              "https://slack.com/api/oauth.v2.access",
              {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                  client_id: clientId,
                  client_secret: clientSecret,
                  code,
                  redirect_uri: redirectURI,
                }),
              },
            );
            if (!resp.ok) {
              const text = await resp.text();
              throw new Error(
                `Slack token exchange HTTP ${resp.status}: ${text.slice(0, 200)}`,
              );
            }
            const body = (await resp.json()) as {
              ok: boolean;
              error?: string;
              authed_user?: { access_token?: string; scope?: string };
            };
            if (!body.ok || !body.authed_user?.access_token) {
              throw new Error(
                `Slack token exchange failed: ${body.error ?? "no user token returned — ensure user_scope is configured"}`,
              );
            }
            return {
              accessToken: body.authed_user.access_token,
              scopes: body.authed_user.scope
                ? body.authed_user.scope.split(/[\s,]+/).filter(Boolean)
                : ["chat:write"],
            };
          },

          getUserInfo: async (tokens) => {
            const token = tokens.accessToken!;
            const testResp = await fetch("https://slack.com/api/auth.test", {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!testResp.ok) {
              const text = await testResp.text();
              console.error(
                `Slack auth.test HTTP ${testResp.status}: ${text.slice(0, 200)}`,
              );
              return null;
            }
            const test = (await testResp.json()) as {
              ok: boolean;
              error?: string;
              user_id?: string;
              user?: string;
            };
            if (!test.ok || !test.user_id) return null;

            return {
              id: test.user_id,
              name: test.user,
              email: `${test.user_id}@slack.local`,
              emailVerified: false,
            };
          },
        },
      ],
    }),
  ],
});
