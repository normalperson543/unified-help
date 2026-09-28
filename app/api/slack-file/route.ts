import { type NextRequest } from "next/server";
import { getUserAuthStatus } from "@/app/lib/data";
import { jsonResponse } from "@/app/lib/tools";
import {
  downloadFilename,
  isAllowedSlackFileUrl,
  isInlineSafeContentType,
  verifySlackFileSignature,
} from "@/app/lib/slack-file";

export async function GET(req: NextRequest) {
  const authStatus = await getUserAuthStatus();
  if (authStatus.status === "unauthenticated") {
    return jsonResponse({ status: "Unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl.searchParams.get("url");
  const sig = req.nextUrl.searchParams.get("sig");
  if (!url || !sig) {
    return jsonResponse({ status: "Missing url or sig" }, { status: 400 });
  }

  if (!verifySlackFileSignature(url, sig)) {
    return jsonResponse({ status: "Invalid signature" }, { status: 403 });
  }

  if (!isAllowedSlackFileUrl(url)) {
    return jsonResponse({ status: "Disallowed host" }, { status: 400 });
  }

  try {
    const slackRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env["SLACK_BOT_TOKEN"] as string}`,
      },
      redirect: "error",
    });

    if (!slackRes.ok || !slackRes.body) {
      return jsonResponse({ status: "Could not fetch file" }, { status: 502 });
    }

    const contentType =
      slackRes.headers.get("content-type") ?? "application/octet-stream";

    const headers = new Headers();
    headers.set("content-type", contentType);
    const contentLength = slackRes.headers.get("content-length");
    if (contentLength) headers.set("content-length", contentLength);
    if (!isInlineSafeContentType(contentType)) {
      headers.set(
        "content-disposition",
        `attachment; filename="${downloadFilename(url)}"`,
      );
    }
    headers.set("x-content-type-options", "nosniff");
    headers.set("content-security-policy", "sandbox");
    headers.set("cache-control", "private, no-store");

    return new Response(slackRes.body, { status: 200, headers });
  } catch (e) {
    console.error("Error proxying Slack file:", e);
    return jsonResponse({ status: "Could not fetch file" }, { status: 502 });
  }
}
