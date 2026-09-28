import { Avatar, Chip } from "@heroui/react";
import Link from "next/link";
import { FileIcon } from "lucide-react";
import SlackMessage from "./slack-message";
import { SlackAttachment } from "../lib/types";

function safeExternalHref(url: string): string {
  try {
    return new URL(url).protocol === "https:" ? url : "#";
  } catch {
    return "#";
  }
}

export default function Post({
  username,
  message,
  slackId,
  op = false,
  isHelper = false,
  dateCreated,
  programId,
  attachments,
}: {
  username: string;
  message: string;
  slackId: string;
  op?: boolean;
  isHelper?: boolean;
  dateCreated: Date;
  programId: string;
  attachments?: SlackAttachment[];
}) {
  return (
    <div className="flex min-w-0 flex-row gap-4">
      <Link href={`/profile/${slackId}/program/${programId}`}>
        <Avatar size="sm">
          <Avatar.Image
            src={`https://cachet.dunkirk.sh/users/${slackId}/r`}
            alt="Profile picture"
          />
          <Avatar.Fallback>{username.substring(0, 1)}</Avatar.Fallback>
        </Avatar>
      </Link>
      <div className="flex min-w-0 flex-col gap-4 w-full">
        <div className="flex flex-row flex-wrap justify-between gap-x-4 gap-y-1">
          <div className="flex flex-row gap-2 items-center">
            <Link href={`/profile/${slackId}/program/${programId}`}>
              <p className="font-bold">{username}</p>
            </Link>
            <div className="flex gap-2">
              {op && (
                <Chip variant="primary" color="accent">
                  OP
                </Chip>
              )}
            </div>
            <div className="flex gap-2">
              {isHelper && (
                <Chip variant="primary" color="success">
                  Helper
                </Chip>
              )}
            </div>
          </div>
          <p className="text-muted shrink-0">
            {" "}
            {new Date(dateCreated).toLocaleString()}
          </p>
        </div>
        <SlackMessage text={message} />
        {attachments && attachments.length > 0 && (
          <div className="flex flex-col gap-2">
            {attachments.map((attachment) => {
              const href =
                attachment.proxyUrl ??
                safeExternalHref(
                  attachment.permalinkPublic ||
                    attachment.permalink ||
                    attachment.urlPrivate,
                );

              if (attachment.isImage && attachment.thumbProxyUrl) {
                return (
                  <a
                    key={attachment.id}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-fit"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={attachment.thumbProxyUrl}
                      alt={attachment.title}
                      className="max-w-xs rounded-md border border-default-200"
                    />
                  </a>
                );
              }

              return (
                <a
                  key={attachment.id}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 w-fit p-2 rounded-md border border-default-200 hover:bg-default-100"
                >
                  <FileIcon size={16} />
                  <span className="truncate max-w-xs">
                    {attachment.title || attachment.name}
                  </span>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
