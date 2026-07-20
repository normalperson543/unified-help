"use client";
import { Avatar, Chip, EmptyState, Table } from "@heroui/react";
import { CheckIcon, CircleQuestionMarkIcon } from "lucide-react";
import { SlackUserWithStats } from "../lib/types";
import Link from "next/link";

export default function UsersTable({
  users,
  programId,
}: {
  users: SlackUserWithStats[];
  programId?: string;
}) {
  return (
    <Table>
      <Table.ScrollContainer className="max-h-96">
        <Table.Content aria-label="Users">
          <Table.Header className="sticky top-0 z-10 bg-surface-secondary">
            <Table.Column isRowHeader>Username</Table.Column>
            <Table.Column>ID</Table.Column>
            <Table.Column>Created</Table.Column>
            <Table.Column>Assigned</Table.Column>
            <Table.Column>Resolved</Table.Column>
          </Table.Header>
          <Table.Body
            renderEmptyState={() => (
              <EmptyState className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                <CircleQuestionMarkIcon className="text-muted" />
                <span className="text-sm text-muted">No users found</span>
              </EmptyState>
            )}
          >
            {users.map((u) => (
              <Table.Row key={u.id}>
                <Table.Cell>
                  <div className="flex gap-2 items-center shrink w-fit">
                    <Link
                      href={`/profile/${u.id}${programId ? `/program/${programId}` : ""}`}
                    >
                      <Avatar size="sm">
                        <Avatar.Image
                          src={`https://cachet.dunkirk.sh/users/${u.id}/r`}
                          alt="Profile picture"
                        />
                        <Avatar.Fallback>
                          {u.username.substring(0, 1)}
                        </Avatar.Fallback>
                      </Avatar>
                    </Link>
                    <Link
                      href={`/profile/${u.id}${programId ? `/program/${programId}` : ""}`}
                    >
                      <b>{u.username}</b>
                    </Link>
                    {u.isBot && <Chip>Bot</Chip>}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <pre>{u.id}</pre>
                </Table.Cell>
                <Table.Cell>{u._count.createdTickets}</Table.Cell>
                <Table.Cell>{u._count.assignedTickets}</Table.Cell>
                <Table.Cell>{u.resolvedAssignedCount}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
