export type Suggestion = {
  sourceTicketId: string;
  draftReply: string;
  reasoning: string;
};

export type SuggestedSolutionResult =
  | { status: "ready"; suggestions: Suggestion[] }
  | { status: "error"; error: string; suggestions: Suggestion[] };
