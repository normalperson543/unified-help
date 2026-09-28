import { type NextRequest } from "next/server";
import { getUserAuthStatus } from "@/app/lib/data";
import { jsonResponse } from "@/app/lib/tools";

const ALLOWED_HOSTS = new Set(["slack-files.com"]);

export async function GET(req: NextRequest) {
  const authStatus = await getUserAuthStatus();
  if (authStatus.status === "unauthenticated") {
    return jsonResponse({ status: "Unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return jsonResponse({ status: "Missing url" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return jsonResponse({ status: "Invalid url" }, { status: 400 });
  }

  const isAllowedHost =
    ALLOWED_HOSTS.has(parsed.hostname)

  if (!isAllowedHost) {
    return jsonResponse({ status: "Disallowed host" }, { status: 400 });
  }

  try {
    const slackRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env["SLACK_BOT_TOKEN"] as string}`,
      },
    });

    if (!slackRes.ok) {
      return new Response(await slackRes.text(), {
        status: slackRes.status,
        statusText: slackRes.statusText,
      });
    }

    const headers = new Headers();
    const forwardHeaders = [
      "content-type",
      "content-length",
      "content-disposition",
      "cache-control",
      "etag",
      "last-modified",
    ];
    for (const name of forwardHeaders) {
      const value = slackRes.headers.get(name);
      if (value) headers.set(name, value);
    }

    return new Response(slackRes.body, {
      status: slackRes.status,
      headers,
    });
  } catch (e) {
    console.error("Error proxying Slack file:", e);
    return jsonResponse({ status: "Could not fetch file" }, { status: 502 });
  }
}
