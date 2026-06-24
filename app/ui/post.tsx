import { Avatar, Chip } from "@heroui/react";

export default function Post({
  username,
  message,
  slackId,
  op = false,
}: {
  username: string;
  message: string;
  slackId: string;
  op?: boolean;
}) {
  return (
    <div className="flex flex-row gap-4">
      <Avatar size="sm">
        <Avatar.Image
          src={`https://cachet.dunkirk.sh/users/${slackId}/r`}
          alt="Profile picture"
        />
        <Avatar.Fallback>{username.substring(0, 1)}</Avatar.Fallback>
      </Avatar>
      <div className="flex flex-col gap-4">
        <div className="flex flex-row gap-4">
          <p className="font-bold">{username}</p>
          <div className="flex gap-2">{op && <Chip>OP</Chip>}</div>
        </div>
        <p>{message}</p>
      </div>
    </div>
  );
}
