"use client";

import { fetcher } from "@/app/lib/swr";
import {
  Button,
  Card,
  Spinner,
  Alert,
} from "@heroui/react";
import {
  LightbulbIcon,
  RefreshCwIcon,
  TriangleAlertIcon,
  SparklesIcon,
} from "lucide-react";
import useSWR from "swr";
import type { SuggestedSolutionResult, Suggestion } from "@/app/lib/ai/types";

export default function SuggestedSolutions({
  ticketId,
  programId,
  onUseSuggestionAction,
}: {
  ticketId: string;
  programId: string;
  onUseSuggestionAction: (text: string) => void;
}) {
  const { data, error, isLoading, mutate } = useSWR<SuggestedSolutionResult>(
    `/api/ticket/${ticketId}/suggestions`,
    fetcher,
  );

  const hasSuggestions = data && data.status === "ready" && data.suggestions.length > 0;
  const isError = data?.status === "error" || Boolean(error);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-muted">
          <SparklesIcon width={16} />
          AI-suggested replies
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => mutate()}
          isPending={isLoading}
          isIconOnly
        >
          {isLoading ? (
            <Spinner color="current" size="sm" />
          ) : (
            <RefreshCwIcon width={14} />
          )}
        </Button>
      </div>

      {isLoading && !data && (
        <div className="flex items-center gap-2 text-sm text-muted">
          <Spinner size="sm" />
          Finding similar tickets and drafting replies…
        </div>
      )}

      {isError && (
        <Alert status="warning">
          <Alert.Indicator>
            <TriangleAlertIcon />
          </Alert.Indicator>
          <Alert.Content>
            <Alert.Title>Could not load suggestions</Alert.Title>
            <Alert.Description>
              {data?.status === "error"
                ? data.error
                : "Please try again later."}
            </Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      {data?.status === "ready" && data.suggestions.length === 0 && !isLoading && (
        <p className="text-sm text-muted">
          No relevant suggestions found based on previous tickets.
        </p>
      )}

      {hasSuggestions &&
        data.suggestions.map((suggestion) => (
          <SuggestionCard
            key={suggestion.sourceTicketId}
            suggestion={suggestion}
            programId={programId}
            onUseSuggestionAction={onUseSuggestionAction}
          />
        ))}
    </div>
  );
}

function SuggestionCard({
  suggestion,
  programId,
  onUseSuggestionAction,
}: {
  suggestion: Suggestion;
  programId: string;
  onUseSuggestionAction: (text: string) => void;
}) {
  return (
    <Card className="p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <LightbulbIcon width={16} />
        Suggested reply
      </div>
      <p className="whitespace-pre-wrap text-sm">{suggestion.draftReply}</p>
      <p className="text-xs text-muted">{suggestion.reasoning}</p>
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onUseSuggestionAction(suggestion.draftReply)}
        >
          Use this reply
        </Button>
        <a
          href={`/programs/${programId}/ticket/${suggestion.sourceTicketId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted hover:underline"
        >
          View source ticket
        </a>
      </div>
    </Card>
  );
}
