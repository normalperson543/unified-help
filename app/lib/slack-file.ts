import { createHmac, timingSafeEqual } from "node:crypto";
import { SlackAttachment } from "./types";

const ALLOWED_HOSTS = new Set(["slack-files.com", "files.slack.com"]);

const INLINE_SAFE_CONTENT_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/bmp",
]);

function signingKey(): string | undefined {
  return (
    process.env["SLACK_FILE_SIGNING_SECRET"] ?? process.env["SLACK_BOT_TOKEN"]
  );
}

export function isAllowedSlackFileUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && ALLOWED_HOSTS.has(parsed.hostname);
  } catch {
    return false;
  }
}

export function slackFileProxyUrlFor(url: string): string | undefined {
  const key = signingKey();
  if (!key || !isAllowedSlackFileUrl(url)) return undefined;
  const sig = createHmac("sha256", key).update(url).digest("base64url");
  return `/api/slack-file?url=${encodeURIComponent(url)}&sig=${encodeURIComponent(sig)}`;
}

export function verifySlackFileSignature(url: string, sig: string): boolean {
  const key = signingKey();
  if (!key) return false;
  const expected = Buffer.from(
    createHmac("sha256", key).update(url).digest("base64url"),
  );
  const provided = Buffer.from(sig);
  return (
    expected.length === provided.length && timingSafeEqual(expected, provided)
  );
}

export function isInlineSafeContentType(contentType: string): boolean {
  const base = contentType.split(";")[0]?.trim().toLowerCase() ?? "";
  return INLINE_SAFE_CONTENT_TYPES.has(base);
}

export function downloadFilename(url: string): string {
  const segment = new URL(url).pathname.split("/").filter(Boolean).pop();
  const safe = (segment ?? "")
    .replace(/[^A-Za-z0-9._-]/g, "")
    .slice(0, 100);
  return safe.length > 0 ? safe : "file";
}

export function withSignedProxyUrls(
  attachments: Record<string, SlackAttachment[]>,
): Record<string, SlackAttachment[]> {
  return Object.fromEntries(
    Object.entries(attachments).map(([ts, list]) => [
      ts,
      list.map((attachment) => ({
        ...attachment,
        proxyUrl: slackFileProxyUrlFor(attachment.urlPrivate),
        thumbProxyUrl: slackFileProxyUrlFor(
          attachment.thumb360 || attachment.urlPrivate,
        ),
      })),
    ]),
  );
}
