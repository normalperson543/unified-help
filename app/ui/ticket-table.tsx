// this was actually not made with claude code mb

import { Avatar, Button, Chip, CircleDashedIcon, EmptyState, Link, Table, TableLayout, Tooltip, Virtualizer } from "@heroui/react";
import { CircleIcon, SquareArrowOutUpRightIcon, CheckIcon, CircleQuestionMarkIcon } from "lucide-react";
import { TicketWithAssigneesAndProgram } from "../lib/types";

export default function TicketTable({
  tickets,
}: {
  tickets: TicketWithAssigneesAndProgram[];
}) {
  return (
    <Virtualizer
      layout={TableLayout}
      layoutOptions={{
        headingHeight: 42,
        rowHeight: 64,
      }}
    >
      <Table>
        <Table.ScrollContainer>
          <Table.Content
            aria-label="Assigned tickets"
            className="max-h-96 overflow-auto"
          >
            <Table.Header className="h-full w-full">
              <Table.Column isRowHeader>Program</Table.Column>
              <Table.Column>Date created</Table.Column>
              <Table.Column>Message</Table.Column>
              <Table.Column>Status</Table.Column>
              <Table.Column>Assignees</Table.Column>
              <Table.Column>First response</Table.Column>
              <Table.Column>Resolve time</Table.Column>
              <Table.Column>Open</Table.Column>
            </Table.Header>
            <Table.Body
              renderEmptyState={() => (
                <EmptyState className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                  <CircleQuestionMarkIcon className="text-muted" />
                  <span className="text-sm text-muted">No tickets found</span>
                </EmptyState>
              )}
            >
              {tickets.map((t) => (
                <Table.Row key={t.id}>
                  <Table.Cell>{t.program.name}</Table.Cell>
                  <Table.Cell>{t.dateCreated.toLocaleString()}</Table.Cell>
                  <Table.Cell>{t.message.substring(0, 30)}</Table.Cell>
                  <Table.Cell>
                    {t.status === 0 && (
                      <Chip color="warning" variant="primary">
                        <CircleDashedIcon width={16} /> Open
                      </Chip>
                    )}
                    {t.status === 1 && (
                      <Chip color="accent" variant="primary">
                        <CircleIcon width={16} /> Assigned
                      </Chip>
                    )}
                    {t.status === 2 && (
                      <Chip color="success" variant="primary">
                        <CheckIcon width={16} /> Resolved
                      </Chip>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex -space-x-2">
                      {t.assignees.map((user) => (
                        <Tooltip delay={0} key={user.id}>
                          <Tooltip.Trigger>
                            <Link
                              href={`/profile/${user.id}/program/${t.programId}`}
                            >
                              <Avatar size="sm">
                                <Avatar.Image
                                  src={`https://cachet.dunkirk.sh/users/${user.id}/r`}
                                  alt="Profile picture"
                                />
                                <Avatar.Fallback>
                                  {user.username.substring(0, 1)}
                                </Avatar.Fallback>
                              </Avatar>
                            </Link>
                          </Tooltip.Trigger>
                          <Tooltip.Content>
                            <p>{user.username}</p>
                          </Tooltip.Content>
                        </Tooltip>
                      ))}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    {t.firstResponseUser ? (
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/profile/${t.firstResponseUser?.id}/program/${t.program?.id}`}
                        >
                          <Tooltip delay={0}>
                            <Tooltip.Trigger>
                              <Avatar size="sm">
                                <Avatar.Image
                                  src={`https://cachet.dunkirk.sh/users/${t.firstResponseUser?.id}/r`}
                                  alt="Profile picture"
                                />
                                <Avatar.Fallback>
                                  {t.firstResponseUser?.username.substring(
                                    0,
                                    1,
                                  )}
                                </Avatar.Fallback>
                              </Avatar>{" "}
                            </Tooltip.Trigger>
                            <Tooltip.Content>
                              <p>{t.firstResponseUser?.username}</p>
                            </Tooltip.Content>
                          </Tooltip>
                        </Link>{" "}
                        <p className="text-muted">
                          in{" "}
                          {t.responseTime
                            ? Math.round((t.responseTime / 60) * 100) / 100
                            : "N/A"}
                          m
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted">N/A</p>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {t.resolver ? (
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/profile/${t.resolver?.id}/program/${t.program?.id}`}
                        >
                          <Tooltip delay={0}>
                            <Tooltip.Trigger>
                              <Avatar size="sm">
                                <Avatar.Image
                                  src={`https://cachet.dunkirk.sh/users/${t.resolver?.id}/r`}
                                  alt="Profile picture"
                                />
                                <Avatar.Fallback>
                                  {t.resolver?.username.substring(0, 1)}
                                </Avatar.Fallback>
                              </Avatar>{" "}
                            </Tooltip.Trigger>
                            <Tooltip.Content>
                              <p>{t.resolver?.username}</p>
                            </Tooltip.Content>
                          </Tooltip>
                        </Link>{" "}
                        <p className="text-muted">
                          in{" "}
                          {t.resolveTime
                            ? Math.round((t.resolveTime / 60) * 100) / 100
                            : "N/A"}
                          m
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted">N/A</p>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Link
                      href={`/programs/${t.program.id}/ticket/${t.id}`}
                      target="_blank"
                    >
                      <Button variant="tertiary">
                        <SquareArrowOutUpRightIcon />
                      </Button>
                    </Link>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
    </Virtualizer>
  );
}
