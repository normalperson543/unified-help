import { getSlackUser } from "./data";

export function jsonResponse(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
}

export function getShortTitle(str: string) {
  let cutoff = str.length;
  const KEYWORDS = [",", ".", "-", ":", ";", " and ", " or ", "?"];
  KEYWORDS.forEach((k) => {
    const index = str.indexOf(k);
    if (index === -1) return;
    if (index < cutoff) cutoff = index;
  });
  return str.substring(0, cutoff);
}

export async function getResolver(str: string) {
  const firstPart = str.substring(str.indexOf("<@") + 2);
  const userId = firstPart.substring(0, firstPart.indexOf(">"));
  return await getSlackUser(userId);
}
