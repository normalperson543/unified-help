export const ITEMS_PER_PAGE = 20;
export const REFRESH_INTERVAL = 5000;
export const RESOLVE_MACROS = [
  {
    keyword: "could you send that question to the Hackatime team",
    friendlyMessage: "Redirected to Hackatime Help",
  },
  {
    keyword: "please could you ask questions about identity verification",
    friendlyMessage: "Redirected to IDV help",
  },
  {
    keyword: "Would you mind directing any fraud related queries to",
    friendlyMessage: "Redirected to FS",
  },
  {
    keyword: "Please ask questions about project shipping or certifications",
    friendlyMessage: "Redirected to Shipwrights",
  },
  {
    keyword: "It seems like this ticket has been inactive for some days so I'll be closing it",
    friendlyMessage: "Resolved as stale"
  }
];