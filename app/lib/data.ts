"use server";
import { prisma } from "./prisma";

export async function getSlackUser(id: string) {
  return await prisma.slackUser.findUnique({
    where: {
      id: id,
    },
    include: {
      programs: true,
    },
  });
}