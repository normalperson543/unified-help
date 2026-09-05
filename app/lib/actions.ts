"use server";

import { headers } from "next/headers";
import { auth } from "./auth";
import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import {
  createUser,
  isParentMessageDeleted,
  postMacroMessage,
  postMessageAsResolver,
  reopenMessage,
  replyAsUser,
  resolveMessage,
} from "./slack";
import { getManagedProgramMacro } from "./constants";
import { redirect } from "next/navigation";
import {
  canCreateManagedProgram,
  isAdmin,
  isHelper,
  isOrg,
} from "./data";
import { throwIfNoAuth } from "./data";

// most of the HC CDN implementation was created with AI

const ALLOWED_LOGO_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
  ".ico",
];

function validateProgramLogo(url: string): string {
  if (!url) return url;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Invalid program icon URL");
  }

  if (
    parsed.protocol !== "https:" ||
    parsed.hostname.toLowerCase() !== "cdn.hackclub.com"
  ) {
    throw new Error("Program icons must be hosted on https://cdn.hackclub.com");
  }

  const pathname = parsed.pathname.toLowerCase();
  const hasImageExtension = ALLOWED_LOGO_EXTENSIONS.some((ext) =>
    pathname.endsWith(ext),
  );
  if (!hasImageExtension) {
    throw new Error(
      "Program icons must be image files (.png, .jpg, .jpeg, .gif, .webp, .svg, .ico)",
    );
  }

  return parsed.toString();
}

const MAX_LOGO_FILE_SIZE = 1024 * 1024; // 1 MB

async function uploadLogoToCdn(file: File): Promise<string> {
  const apiKey = process.env["HACKCLUB_CDN_API_KEY"];
  if (!apiKey || apiKey === "sk_cdn_...") {
    throw new Error("Hack Club CDN API key is not configured");
  }

  const uploadFormData = new FormData();
  uploadFormData.set("file", file);

  const resp = await fetch("https://cdn.hackclub.com/api/v4/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: uploadFormData,
  });

  if (!resp.ok) {
    const body = await resp.json().catch(() => null);
    if (body && typeof body.message === "string") {
      throw new Error(body.message);
    }
    throw new Error("Failed to upload program icon");
  }

  const data = await resp.json();
  if (!data.url || typeof data.url !== "string") {
    throw new Error("Invalid upload response");
  }

  return data.url;
}

export async function uploadProgramLogo(formData: FormData) {
  await throwIfNoAuth();

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    throw new Error("No file provided");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Program icons must be image files");
  }

  if (file.size > MAX_LOGO_FILE_SIZE) {
    throw new Error("Program icons must be smaller than 1 MB");
  }

  return uploadLogoToCdn(file);
}

export async function lookupSlackUser(slackId: string) {
  await throwIfNoAuth();
  return await createUser(slackId);
}

export async function startBacklog(
  programId: string,
  backlogTo?: string | null,
  backlogFrom?: string | null,
) {
  await throwIfNoAuth();
  const org = await isOrg(programId);
  if (!org) throw new Error("unauthorized");
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user || !session.user.id) {
    throw new Error("unauthenticated");
  }
  const resp = await fetch(
    `${process.env["SCRAPER_API_URL"]}/api/backlog/${programId}/start`,
    {
      method: "POST",
      body: JSON.stringify({
        programId: programId,
        backlogTo: backlogTo,
        backlogFrom: backlogFrom,
        actorId: session.user.id,
      }),
      headers: {
        "Content-type": "application/json",
        "x-api-key": process.env["SCRAPER_API_KEY"]!,
      },
    },
  );
  if (!resp.ok) {
    throw new Error("Could not start backlog job");
  }
  revalidatePath(`/programs/${programId}/settings`);
}

export async function stopBacklog(programId: string) {
  await throwIfNoAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user || !session.user.id) {
    throw new Error("unauthenticated");
  }
  const resp = await fetch(
    `${process.env["SCRAPER_API_URL"]}/api/backlog/${programId}/stop`,
    {
      method: "POST",
      body: JSON.stringify({
        programId: programId,
        actorId: session.user.id,
      }),
      headers: {
        "Content-type": "application/json",
        "x-api-key": process.env["SCRAPER_API_KEY"]!,
      },
    },
  );
  if (!resp.ok) {
    throw new Error("Could not stop backlog job");
  }
  revalidatePath(`/programs/${programId}/settings`);
}

export async function addAsHelper(
  slackId: string,
  programId: string,
  revalidate: boolean = true,
) {
  await throwIfNoAuth();
  const org = await isOrg(programId);
  if (!org) throw new Error("unauthorized");
  await createUser(slackId);
  await prisma.slackUser.update({
    where: {
      id: slackId,
    },
    data: {
      programs: {
        connect: {
          id: programId,
        },
      },
    },
  });
  if (revalidate) {
    revalidatePath(`/programs/${programId}/settings`);
  }
}

export async function removeHelper(slackId: string, programId: string) {
  await throwIfNoAuth();
  const org = await isOrg(programId);
  if (!org) throw new Error("unauthorized");
  await prisma.slackUser.update({
    where: {
      id: slackId,
    },
    data: {
      programs: {
        disconnect: {
          id: programId,
        },
      },
    },
  });
  revalidatePath(`/programs/${programId}/settings`);
}

export async function saveUserGroup(groupId: string, programId: string) {
  await throwIfNoAuth();
  const org = await isOrg(programId);
  if (!org) throw new Error("unauthorized");
  await prisma.program.update({
    where: {
      id: programId,
    },
    data: {
      userGroup: groupId,
    },
  });
  indexUsersFromUserGroup(groupId, programId); // not async on purpose :p
  revalidatePath(`/programs/${programId}/settings`);
}
export async function saveHelperChannelId(
  channelId: string,
  programId: string,
) {
  await throwIfNoAuth();
  const org = await isOrg(programId);
  if (!org) throw new Error("unauthorized");
  await prisma.program.update({
    where: {
      id: programId,
    },
    data: {
      helperChannelId: channelId,
    },
  });
  indexUsersFromChannel(channelId, programId); // not async on purpose :p
  revalidatePath(`/programs/${programId}/settings`);
}
export async function updateInfo(
  programId: string,
  name: string,
  canAutoIndex: boolean,
  resolveKeyword: string,
  channelId: string,
  allowResolver: boolean,
  supportBotId: string,
  allowReply: boolean,
  logoFile: File | null,
  imageLink: string,
) {
  await throwIfNoAuth();
  const org = await isOrg(programId);
  if (!org) throw new Error("unauthorized");

  let validatedLogo = "";
  if (logoFile) {
    validatedLogo = await uploadLogoToCdn(logoFile);
  } else if (imageLink) {
    validatedLogo = validateProgramLogo(imageLink);
  }

  await prisma.program.update({
    where: {
      id: programId,
    },
    data: {
      name: name,
      canAutoIndex: canAutoIndex,
      resolveKeyword: resolveKeyword,
      channelId: channelId,
      allowResolver: allowResolver,
      supportBotId: supportBotId,
      allowReply: allowReply,
      logo: validatedLogo,
    },
  });
  revalidatePath(`/programs/${programId}/settings`);
  return validatedLogo;
}
export async function createProgram(
  name: string,
  channelId: string,
  canAutoIndex: boolean,
  logoFile: File | null,
  imageLink: string,
  resolveKeyword: string,
) {
  await throwIfNoAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user || !session.user.id) {
    throw new Error("unauthenticated");
  }

  let validatedLogo = "";
  if (logoFile) {
    validatedLogo = await uploadLogoToCdn(logoFile);
  } else if (imageLink) {
    validatedLogo = validateProgramLogo(imageLink);
  }

  const program = await prisma.program.create({
    data: {
      name: name,
      channelId: channelId,
      canAutoIndex: canAutoIndex,
      logo: validatedLogo,
      resolveKeyword: resolveKeyword,
      usersOrganizing: {
        connect: {
          id: session.user.id,
        },
      },
      assignedUsers: {
        connect: {
          id: session.user.slackId as string,
        },
      },
    },
  });
  redirect(`/programs/${program.id}`);
}
export async function createManagedProgram(
  name: string,
  helpChannelId: string,
  orgChannelId: string,
  logoFile: File | null,
  imageLink: string,
  createMessage: string,
  resolveMessage: string,
  supportBotName: string,
) {
  await throwIfNoAuth();
  if (!(await canCreateManagedProgram())) throw new Error("unauthorized");
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user || !session.user.id) {
    throw new Error("unauthenticated");
  }

  let validatedLogo = "";
  if (logoFile) {
    validatedLogo = await uploadLogoToCdn(logoFile);
  } else if (imageLink) {
    validatedLogo = validateProgramLogo(imageLink);
  }

  const program = await prisma.program.create({
    data: {
      name: name,
      managed: true,
      channelId: helpChannelId,
      canAutoIndex: true,
      logo: validatedLogo,
      resolveKeyword: "marked this as resolved",
      createMessage: createMessage,
      resolveMessage: resolveMessage,
      usersOrganizing: {
        connect: {
          id: session.user.id,
        },
      },
      assignedUsers: {
        connect: {
          id: session.user.slackId as string,
        },
      },
      supportBotName: supportBotName
    },
  });
  await saveHelperChannelId(orgChannelId, program.id);
  redirect(`/programs/${program.id}/settings`);
}
export async function indexUsersFromUserGroup(
  groupId: string,
  programId: string,
) {
  await throwIfNoAuth();
  const org = await isOrg(programId);
  if (!org) throw new Error("unauthorized");
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user || !session.user.id) {
    throw new Error("unauthenticated");
  }
  const resp = await fetch(
    `${process.env["SCRAPER_API_URL"]}/api/index-user-group/${programId}`,
    {
      method: "POST",
      body: JSON.stringify({
        usergroupId: groupId,
      }),
      headers: {
        "Content-type": "application/json",
        "x-api-key": process.env["SCRAPER_API_KEY"]!,
      },
    },
  );
  if (!resp.ok) {
    throw new Error("Could not start user indexing");
  }
  revalidatePath(`/programs/${programId}/settings`);
}

export async function indexUsersFromChannel(
  channelId: string,
  programId: string,
) {
  await throwIfNoAuth();
  const org = await isOrg(programId);
  if (!org) throw new Error("unauthorized");
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user || !session.user.id) {
    throw new Error("unauthenticated");
  }
  const resp = await fetch(
    `${process.env["SCRAPER_API_URL"]}/api/index-channel/${programId}`,
    {
      method: "POST",
      body: JSON.stringify({
        channelId: channelId,
      }),
      headers: {
        "Content-type": "application/json",
        "x-api-key": process.env["SCRAPER_API_KEY"]!,
      },
    },
  );
  if (!resp.ok) {
    throw new Error("Could not start user indexing");
  }
  revalidatePath(`/programs/${programId}/settings`);
}

export async function promoteHelper(userId: string, programId: string) {
  await throwIfNoAuth();
  const org = await isOrg(programId);
  if (!org) throw new Error("unauthorized");
  await prisma.program.update({
    where: {
      id: programId,
    },
    data: {
      usersOrganizing: {
        connect: {
          id: userId,
        },
      },
    },
  });
  revalidatePath(`/programs/${programId}/settings`);
}
export async function demoteHelper(userId: string, programId: string) {
  await throwIfNoAuth();
  const org = await isOrg(programId);
  if (!org) throw new Error("unauthorized");

  await prisma.program.update({
    where: {
      id: programId,
    },
    data: {
      usersOrganizing: {
        disconnect: {
          id: userId,
        },
      },
    },
  });
  revalidatePath(`/programs/${programId}/settings`);
}
export async function createTag(name: string, programId: string) {
  await throwIfNoAuth();
  const org = await isOrg(programId);
  if (!org) throw new Error("unauthorized");

  await prisma.tag.create({
    data: {
      programId: programId,
      name: name,
    },
  });
  revalidatePath(`/programs/${programId}/settings`);
}
export async function deleteTag(id: string, programId: string) {
  await throwIfNoAuth();
  const org = await isOrg(programId);
  if (!org) throw new Error("unauthorized");

  await prisma.tag.delete({
    where: {
      id: id,
    },
  });
  revalidatePath(`/programs/${programId}/settings`);
}
export async function connectTag(
  tagId: string,
  ticketId: string,
  programId: string,
) {
  await throwIfNoAuth();
  const helper = await isHelper(programId);
  if (!helper) throw new Error("unauthorized");
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { programId: true },
  });
  if (!ticket || ticket.programId !== programId)
    throw new Error("unauthorized");
  const t = await prisma.ticket.update({
    where: {
      id: ticketId,
    },
    data: {
      tag: {
        connect: {
          id: tagId,
        },
      },
    },
  });
  revalidatePath(`/programs/${t.programId}/ticket/${t.id}`);
}
export async function disconnectTag(
  tagId: string,
  ticketId: string,
  programId: string,
) {
  await throwIfNoAuth();
  const helper = await isHelper(programId);
  if (!helper) throw new Error("unauthorized");
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { programId: true },
  });
  if (!ticket || ticket.programId !== programId)
    throw new Error("unauthorized");
  const t = await prisma.ticket.update({
    where: {
      id: ticketId,
    },
    data: {
      tag: {
        disconnect: {
          id: tagId,
        },
      },
    },
  });
  revalidatePath(`/programs/${t.programId}/ticket/${t.id}`);
}
export async function reindexTicket(ticketId: string, programId: string) {
  // this was ai generated as this is an admin-only feature
  await throwIfNoAuth();
  const admin = await isAdmin();
  if (!admin) throw new Error("unauthorized");
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { programId: true },
  });
  if (!ticket || ticket.programId !== programId)
    throw new Error("unauthorized");

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user || !session.user.id) {
    throw new Error("unauthenticated");
  }

  let resp: Response;
  try {
    resp = await fetch(
      `${process.env["SCRAPER_API_URL"]}/api/reindex-ticket/${ticketId}`,
      {
        method: "POST",
        body: JSON.stringify({
          ticketId: ticketId,
          actorId: session.user.id,
        }),
        headers: {
          "Content-type": "application/json",
          "x-api-key": process.env["SCRAPER_API_KEY"]!,
        },
      },
    );
  } catch {
    throw new Error("SCRAPER_OFFLINE");
  }
  if (!resp.ok) {
    const body = await resp.json().catch(() => null);
    if (body && typeof body.error === "string") throw new Error(body.error);
    throw new Error("Could not reindex ticket");
  }
  revalidatePath(`/programs/${programId}/ticket/${ticketId}`);
}
export async function indexThread(ticketId: string, programId: string) {
  await throwIfNoAuth();
  const helper = await isHelper(programId);
  if (!helper) throw new Error("unauthorized");
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { programId: true },
  });
  if (!ticket || ticket.programId !== programId)
    throw new Error("unauthorized");

  let resp: Response;
  try {
    resp = await fetch(
      `${process.env["SCRAPER_API_URL"]}/api/index-thread/${ticketId}`,
      {
        method: "POST",
        body: JSON.stringify({
          ticketId: ticketId,
        }),
        headers: {
          "Content-type": "application/json",
          "x-api-key": process.env["SCRAPER_API_KEY"]!,
        },
      },
    );
  } catch {
    throw new Error("SCRAPER_OFFLINE");
  }
  if (!resp.ok) {
    const body = await resp.json().catch(() => null);
    if (body && typeof body.error === "string") throw new Error(body.error);
    throw new Error("Could not index thread");
  }
  revalidatePath(`/programs/${programId}/ticket/${ticketId}`);
}
export async function replyToTicket(
  ticketId: string,
  programId: string,
  message: string,
  enableCtx: boolean,
) {
  if (message.length === 0) throw new Error("Message is too short");

  let assignedFirst = false;

  await throwIfNoAuth();
  const helper = await isHelper(programId);
  if (!helper) throw new Error("unauthorized");

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user || !session.user.slackId) {
    throw new Error("unauthenticated");
  }

  let ticket = await prisma.ticket.findUnique({
    where: {
      id: ticketId,
    },
    include: {
      _count: {
        select: {
          assignees: true,
        },
      },
      program: true,
    },
  });

  if (!ticket) throw new Error("No ticket");
  if (ticket.programId !== programId) throw new Error("unauthorized");
  if (!ticket.program.allowReply)
    throw new Error("Program has disabled replying");

  if (
    await isParentMessageDeleted(ticket.messageId, ticket.program.channelId)
  ) {
    throw new Error("PARENT_MESSAGE_DELETED");
  }

  const tokenRes = await auth.api.getAccessToken({
    body: { providerId: "slack" },
    headers: await headers(),
  });
  if (!tokenRes?.accessToken) {
    throw new Error("SLACK_NOT_LINKED");
  }

  let r = await prisma.reply.create({
    data: {
      ticketId: ticketId,
      slackUserId: session.user.slackId,
      message: message,
      dateCreated: new Date(),
    },
    include: {
      slackUser: {
        include: {
          programs: true,
        },
      },
    },
  });
  if (
    r.slackUser.programs.some((p) => p.id === programId) &&
    ticket.status !== 2
  ) {
    if (ticket._count.assignees === 0) {
      // first user that responded!!
      assignedFirst = true;
      ticket = await prisma.ticket.update({
        where: {
          id: ticket.id,
        },
        data: {
          firstResponseUserId: r.slackUserId,
          assignDate: r.dateCreated,
        },
        include: {
          _count: {
            select: {
              assignees: true,
            },
          },
          program: true,
        },
      });
    }
    try {
      ticket = await prisma.ticket.update({
        where: {
          id: ticketId,
        },
        data: {
          assignees: {
            connect: [{ id: r.slackUserId }],
          },
          status: 1,
        },
        include: {
          _count: {
            select: {
              assignees: true,
            },
          },
          program: true,
        },
      });
    } catch (e) {
      console.error("Problem assigning an assignee: ", e);
      console.error("Occurred on ticket ", ticket.id);
    }
  }

  const slackR = await replyAsUser(
    tokenRes.accessToken,
    ticket.messageId,
    ticket.program.channelId,
    r.slackUser.id,
    message,
    enableCtx,
    programId,
    ticketId,
  );

  r = await prisma.reply.update({
    where: {
      id: r.id,
    },
    data: {
      messageId: slackR.message?.ts,
    },
    include: {
      slackUser: {
        include: {
          programs: true,
        },
      },
    },
  });
  if (assignedFirst) {
    ticket = await prisma.ticket.update({
      where: {
        id: ticket.id,
      },
      data: {
        responseTime: Number(r.messageId) - Number(ticket.messageId),
      },
      include: {
        _count: {
          select: {
            assignees: true,
          },
        },
        program: true,
      },
    });
  }
  revalidatePath(`/programs/${programId}/ticket/${ticketId}`);
}
export async function resolveTicket(ticketId: string) {
  await throwIfNoAuth();

  const ticket = await prisma.ticket.findUnique({
    where: {
      id: ticketId,
    },
    include: {
      program: true,
    },
  });

  if (!ticket) return;
  if (!ticket.program.allowResolver)
    throw new Error("Program does not allow resolving through Unified Help");

  const helper = await isHelper(ticket.programId);
  if (!helper) throw new Error("unauthorized");

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user || !session.user.slackId) {
    throw new Error("unauthenticated");
  }

  if (
    await isParentMessageDeleted(ticket.messageId, ticket.program.channelId)
  ) {
    throw new Error("PARENT_MESSAGE_DELETED");
  }

  try {
    await prisma.ticket.update({
      where: {
        id: ticket.id,
      },
      data: {
        resolverId: session.user.slackId,
        status: 2,
        resolveTime: (Date.now() - Number(ticket.messageId) * 1000) / 1000,
        resolveDate: new Date(),
      },
      include: {
        program: true,
      },
    });
  } catch (e) {
    console.error("Problem assigning a resolver: ", e);
    console.error("Resolver: ", session.user.slackId);
    console.error("Occurred on ticket ", ticket.id);
    throw e;
  }
  if (ticket.program.managed) {
    await resolveMessage(
      ticket.program.channelId,
      ticket.messageId,
      ticket.program.supportBotName,
      ticket.program.logo ?? "",
      session.user.slackId,
      ticket.program.resolveMessage,
      ticket.id,
      ticket.program.id,
    );
    indexThread(ticket.id, ticket.programId);
  } else {
    await postMessageAsResolver(
      ticket.messageId,
      ticket.program.channelId,
      "?resolve",
      `Marked as resolved by <@${session.user.slackId}>.`,
    );
  }

  revalidatePath(`/programs/${ticket.programId}/ticket/${ticketId}`);
}

export async function resolveTicketWithMacro(
  ticketId: string,
  macroKey: string,
) {
  await throwIfNoAuth();

  const macro = getManagedProgramMacro(macroKey);
  if (!macro) throw new Error("Invalid macro");

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { program: true, slackUser: true },
  });

  if (!ticket) return;
  if (!ticket.program.managed)
    throw new Error("Macros are only available for managed programs");
  if (!ticket.program.allowResolver)
    throw new Error("Program does not allow resolving through Unified Help");

  const helper = await isHelper(ticket.programId);
  if (!helper) throw new Error("unauthorized");

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user || !session.user.slackId) {
    throw new Error("unauthenticated");
  }

  if (
    await isParentMessageDeleted(ticket.messageId, ticket.program.channelId)
  ) {
    throw new Error("PARENT_MESSAGE_DELETED");
  }

  if (macro.macro === "?resolve") {
    return resolveTicket(ticketId);
  }
  if (macro.macro === "?reopen") {
    return reopenTicket(ticketId);
  }

  if (ticket.status === 2) {
    throw new Error("Ticket is already resolved");
  }

  const expandedMessage = macro.message.replace(
    "{USERNAME}",
    ticket.slackUser.username,
  );

  try {
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: 2,
        resolveTime: (Date.now() - Number(ticket.messageId) * 1000) / 1000,
        resolveDate: new Date(),
      },
    });
  } catch (e) {
    console.error("Problem resolving ticket with macro: ", e);
    console.error("Occurred on ticket ", ticket.id);
    throw e;
  }

  await postMacroMessage(
    ticket.program.channelId,
    ticket.messageId,
    ticket.program.supportBotName,
    ticket.program.logo ?? "",
    expandedMessage,
    ticket.id,
    ticket.program.id,
  );

  indexThread(ticket.id, ticket.programId);
  revalidatePath(`/programs/${ticket.programId}/ticket/${ticketId}`);
}

export async function reopenTicket(ticketId: string) {
  await throwIfNoAuth();

  const ticket = await prisma.ticket.findUnique({
    where: {
      id: ticketId,
    },
    include: {
      program: true,
      assignees: true,
    },
  });

  if (!ticket) return;
  if (!ticket.program.allowResolver)
    throw new Error("Program does not allow resolving through Unified Help");

  const helper = await isHelper(ticket.programId);
  if (!helper) throw new Error("unauthorized");

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user || !session.user.slackId) {
    throw new Error("unauthenticated");
  }

  if (
    await isParentMessageDeleted(ticket.messageId, ticket.program.channelId)
  ) {
    throw new Error("PARENT_MESSAGE_DELETED");
  }

  try {
    await prisma.ticket.update({
      where: {
        id: ticket.id,
      },
      data: {
        resolver: {
          disconnect: true,
        },
        resolveTime: 0,
        status: ticket.assignees.length > 0 ? 1 : 0,
        resolveDate: null,
      },
      include: {
        assignees: true,
      },
    });
  } catch (e) {
    console.error("Problem reopening: ", e);
    console.error("Occurred on ticket ", ticket.id);
    throw e;
  }
  if (ticket.program.managed) {
    await reopenMessage(
      ticket.program.channelId,
      ticket.messageId,
      ticket.program.supportBotName,
      ticket.program.logo ?? "",
      session.user.slackId,
      ticket.program.resolveMessage,
      ticket.id,
      ticket.program.id,
    );
    indexThread(ticket.id, ticket.programId);
  } else {
    await postMessageAsResolver(
      ticket.messageId,
      ticket.program.channelId,
      "?reopen",
      `This ticket was reopened by <@${session.user.slackId}>.`,
    );
  }

  revalidatePath(`/programs/${ticket.programId}/ticket/${ticketId}`);
}

export async function postINote(
  ticketId: string,
  programId: string,
  message: string,
) {
  await throwIfNoAuth();
  const helper = await isHelper(programId);
  if (!helper) throw new Error("unauthorized");
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { programId: true },
  });
  if (!ticket || ticket.programId !== programId)
    throw new Error("unauthorized");

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user || !session.user.slackId) {
    throw new Error("unauthenticated");
  }
  await prisma.iNote.create({
    data: {
      ticketId: ticketId,
      slackUserId: session.user.slackId,
      message: message,
    },
  });
  revalidatePath(`/programs/${programId}/ticket/${ticketId}`);
}
export async function deleteProgram(programId: string) {
  await throwIfNoAuth();
  const admin = await isAdmin();
  if (!admin) throw new Error("Unauthorized");
  const tickets = await prisma.ticket.findMany({
    where: {
      programId: programId,
    },
  });
  for (let i = 0; i < tickets.length; i++) {
    await prisma.reply.deleteMany({
      where: {
        ticketId: tickets[i].id,
      },
    });
    await prisma.iNote.deleteMany({
      where: {
        ticketId: tickets[i].id,
      },
    });
  }
  await prisma.tag.deleteMany({
    where: {
      programId: programId,
    },
  });
  await prisma.ticket.deleteMany({
    where: {
      programId: programId,
    },
  });
  await prisma.program.delete({
    where: {
      id: programId,
    },
  });
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
