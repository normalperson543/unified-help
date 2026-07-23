// https://swr.vercel.app/docs/error-handling

// `Error` has no `info`/`status`, so the extra fields the SWR docs attach live
// on a subclass instead of being bolted onto a plain Error.
export class FetchError extends Error {
  info: unknown;
  status: number;

  constructor(message: string, info: unknown, status: number) {
    super(message);
    this.name = "FetchError";
    this.info = info;
    this.status = status;
  }
}

export const fetcher = async (url: string) => {
  const res = await fetch(url);
  // If the status code is not in the range 200-299,
  // we still try to parse and throw it.
  if (!res.ok) {
    throw new FetchError(
      "An error occurred while fetching the data.",
      await res.json(),
      res.status,
    );
  }
  return res.json();
};
