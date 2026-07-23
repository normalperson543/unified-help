// REVIEWER NOTE: This was made with Claude Code

import { Fragment, ReactNode } from "react";

// ---------- Types ----------

interface SlackPattern {
  re: RegExp;
  render: (match: RegExpMatchArray, key: number) => ReactNode;
}

export interface SlackMessageProps {
  text: string;
}

// ---------- Parser ----------

// Patterns are checked in the order given below at each step; the earliest
// match in the remaining string wins, so ordering here only matters for
// same-index ties (code block vs inline code, etc).
const patterns: SlackPattern[] = [
  {
    re: /```([\s\S]+?)```/,
    render: (m, key) => (
      <pre key={key} className="slack-codeblock">
        <code>{m[1]}</code>
      </pre>
    ),
  },
  {
    re: /`([^`]+)`/,
    render: (m, key) => (
      <code key={key} className="slack-inline-code">
        {m[1]}
      </code>
    ),
  },
  {
    re: /\*([^*\n]+)\*/,
    render: (m, key) => <strong key={key}>{parseSlackText(m[1])}</strong>,
  },
  {
    re: /_([^_\n]+)_/,
    render: (m, key) => <em key={key}>{parseSlackText(m[1])}</em>,
  },
  {
    re: /~([^~\n]+)~/,
    render: (m, key) => <s key={key}>{parseSlackText(m[1])}</s>,
  },
  {
    re: /<(https?:\/\/[^|>]+)\|([^>]+)>/,
    render: (m, key) => (
      <a key={key} href={m[1]} target="_blank" rel="noopener noreferrer">
        {m[2]}
      </a>
    ),
  },
  {
    re: /<(https?:\/\/[^>]+)>/,
    render: (m, key) => (
      <a key={key} href={m[1]} target="_blank" rel="noopener noreferrer">
        {m[1]}
      </a>
    ),
  },
];

let keyCounter = 0;

/**
 * Recursively parses a single line of Slack mrkdwn text into React nodes.
 * Not exported as part of the public API surface on its own — use
 * <SlackMessage /> unless you need line-level control.
 */
function parseSlackText(text: string): ReactNode {
  if (!text) return null;

  let earliest: { pattern: SlackPattern; match: RegExpMatchArray } | null =
    null;

  for (const pattern of patterns) {
    const match = text.match(pattern.re);
    if (match && match.index !== undefined) {
      if (earliest === null || match.index < (earliest.match.index as number)) {
        earliest = { pattern, match };
      }
    }
  }

  if (!earliest) return text;

  const { pattern, match } = earliest;
  const index = match.index as number;
  const before = text.slice(0, index);
  const after = text.slice(index + match[0].length);

  return (
    <Fragment key={keyCounter++}>
      {before}
      {pattern.render(match, keyCounter++)}
      {parseSlackText(after)}
    </Fragment>
  );
}

// ---------- Component ----------

export function SlackMessage({ text }: SlackMessageProps) {
  const lines = text.split("\n");

  return (
    <div className="slack-message">
      {lines.map((line, i) => {
        if (line.startsWith("&gt;") || line.startsWith(">")) {
          const quoteText = line.replace(/^&gt;|^>/, "").trim();
          return (
            <blockquote key={i} className="slack-quote">
              {parseSlackText(quoteText)}
            </blockquote>
          );
        }
        return <div key={i}>{parseSlackText(line)}</div>;
      })}
    </div>
  );
}

export default SlackMessage;
