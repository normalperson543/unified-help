import { Prisma } from "@/generated/prisma/client";

export type TicketWithReplies = Prisma.TicketGetPayload<{
  include: {
    replies: {
      include: {
        slackUser: true;
      };
    };
    slackUser: true;
  };
}>;
