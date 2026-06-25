import { Avatar, Chip } from "@heroui/react";

export default function Post({
  username,
  message,
  slackId,
  op = false,
  isHelper = false,
  dateCreated,
}: {
  username: string;
  message: string;
  slackId: string;
  op?: boolean;
  isHelper?: boolean;
  dateCreated: Date;
}) {
  console.log(dateCreated);
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
          <div className="flex gap-2">{op && <Chip variant="primary" color="accent">OP</Chip>}</div>
          <div className="flex gap-2">{isHelper && <Chip variant="primary" color="success">Helper</Chip>}</div>
          <p className="text-muted">
            {" "}
            {new Date(dateCreated).toLocaleString()}
          </p>
        </div>
        <p>{message}</p>
      </div>
    </div>
  );
}
