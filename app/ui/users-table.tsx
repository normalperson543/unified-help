"use client";
import { Avatar, Chip, EmptyState, SortDescriptor, Table } from "@heroui/react";
import { CircleQuestionMarkIcon } from "lucide-react";
import { SlackUserWithStats } from "../lib/types";
import Link from "next/link";

export default function UsersTable({
  users,
  programId,
  sortDescriptor,
  setSortDescriptor,
  height = 96,
}: {
  users: SlackUserWithStats[];
  programId?: string;
  sortDescriptor?: SortDescriptor;
  setSortDescriptor?: (s: SortDescriptor) => void;
  height?: number;
}) {
  return (
    <Table>
      <Table.ScrollContainer className={`max-h-${height}`}>
        <Table.Content
          aria-label="Users"
          sortDescriptor={sortDescriptor}
          onSortChange={setSortDescriptor}
        >
          <Table.Header className="sticky top-0 z-10 bg-surface-secondary">
            <Table.Column allowsSorting isRowHeader id="username">
              {({ sortDirection }) => (
                <Table.SortableColumnHeader sortDirection={sortDirection}>
                  Username
                </Table.SortableColumnHeader>
              )}
            </Table.Column>
            <Table.Column>ID</Table.Column>
            <Table.Column allowsSorting id="createdTickets">
              {({ sortDirection }) => (
                <Table.SortableColumnHeader sortDirection={sortDirection}>
                  Created
                </Table.SortableColumnHeader>
              )}
            </Table.Column>
            <Table.Column allowsSorting id="assignedTickets">
              {({ sortDirection }) => (
                <Table.SortableColumnHeader sortDirection={sortDirection}>
                  Total assigned
                </Table.SortableColumnHeader>
              )}
            </Table.Column>
            <Table.Column allowsSorting id="resolvedTickets">
              {({ sortDirection }) => (
                <Table.SortableColumnHeader sortDirection={sortDirection}>
                  Resolved by user
                </Table.SortableColumnHeader>
              )}
            </Table.Column>
          </Table.Header>
          <Table.Body
            renderEmptyState={() => (
              <EmptyState className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                <CircleQuestionMarkIcon className="text-muted" />
                <span className="text-sm text-muted">No users found</span>
              </EmptyState>
            )}
          >
            <Table.Collection items={users}>
              {(u) => (
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
                  <Table.Cell>{u._count.resolvedTickets}</Table.Cell>
                </Table.Row>
              )}
            </Table.Collection>
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
