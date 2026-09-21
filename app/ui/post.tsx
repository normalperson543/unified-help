import { Avatar, Chip } from "@heroui/react";
import Link from "next/link";
import SlackMessage from "./slack-message";

export default function Post({
  username,
  message,
  slackId,
  op = false,
  isHelper = false,
  dateCreated,
  programId,
}: {
  username: string;
  message: string;
  slackId: string;
  op?: boolean;
  isHelper?: boolean;
  dateCreated: Date;
  programId: string;
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
      </div>
    </div>
  );
}
