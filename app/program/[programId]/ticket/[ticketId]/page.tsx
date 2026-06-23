'use client'

import { Avatar, Chip, Button } from "@heroui/react";
import {
  CheckIcon,
  CircleDashedIcon,
  SquareArrowOutUpRightIcon,
} from "lucide-react";

export default function ThreadUI() {
  return (
    <div className="flex flex-col py-8 px-24 gap-4">
      <div className="flex gap-4">
        <Avatar>
          <Avatar.Fallback>JD</Avatar.Fallback>
        </Avatar>
        <div className="flex flex-col gap-2">
          <h2 className="font-bold text-2xl">
            i ordered the free stickers but i did not received them but the
            status in the mail is showing delivered or something ?
          </h2>
          <div className="flex flex-row gap-4">
            <Chip color="warning" variant="primary">
              <CircleDashedIcon width={16} /> Open
            </Chip>
            <p>Opened 3 days ago</p>
            <p>Assigned</p>
            
          </div>
        </div>
        <Button>
          Open in Slack <SquareArrowOutUpRightIcon />
        </Button>
      </div>
      <div className="flex flex-row gap-4">
        <Avatar>
          <Avatar.Fallback>JD</Avatar.Fallback>
        </Avatar>
        <div className="flex flex-col gap-4">
          <div className="flex flex-row gap-4">
            <p className="font-bold">@John Doe</p>
            <p>John Doe</p>
            <div className="flex gap-2">
              <Chip>OP</Chip>
              <Chip>MCG</Chip>
            </div>
          </div>
          <p></p>
        </div>
      </div>
    </div>
  );
}
