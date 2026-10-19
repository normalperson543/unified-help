export function buildScraperUrl(segments: string[]): URL {
  const base = process.env["SCRAPER_API_URL"];
  if (!base) {
    throw new Error("SCRAPER_API_URL is not configured");
  }

  const url = new URL(base);
  const basePath = url.pathname.replace(/\/+$/, "");
  const encodedSegments = segments.map((segment) => {
    if (typeof segment !== "string") {
      throw new Error("Invalid URL segment");
    }
    return encodeURIComponent(segment);
  });
  url.pathname = basePath
    ? `${basePath}/${encodedSegments.join("/")}`
    : `/${encodedSegments.join("/")}`;
  return url;
}
