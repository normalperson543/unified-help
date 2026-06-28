"use client";

import { fetcher } from "@/app/lib/swr";
import { getShortTitle } from "@/app/lib/tools";
import { ProgramWithAssignees, TicketWithReplies } from "@/app/lib/types";
import {
  Autocomplete,
  Avatar,
  Card,
  ComboBox,
  EmptyState,
  Input,
  Key,
  Label,
  ListBox,
  SearchField,
  Select,
  Spinner,
  Tag,
  TagGroup,
  ToggleButton,
  useFilter,
} from "@heroui/react";
import Link from "next/link";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { ChevronDownIcon, ChevronUpIcon, SearchIcon } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { SlackUser } from "@/generated/prisma/client";

let savedSidebarScrollTop = 0;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const params = useParams();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("0,1,2");
  const [selectedUsers, setSelectedUsers] = useState<Key[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // this useLayoutEffect thing was created with Claude
  useLayoutEffect(() => {
    if (sidebarRef.current) {
      sidebarRef.current.scrollTop = savedSidebarScrollTop;
    }
  });

  const {
    data: programTickets,
    error: programTicketsError,
    isLoading: programTicketsIsLoading,
  } = useSWR<TicketWithReplies[]>(
    `/api/programs/${params.programId}/?searchTerm=${encodeURIComponent(searchTerm)}&assigneeIds=${(selectedUsers as string[]).join(",")}&statuses=${statusFilter}`,
    fetcher,
  );

  const {
    data: program,
    error: programError,
    isLoading: programIsLoading,
  } = useSWR<ProgramWithAssignees>(
    `/api/programs/${params.programId}/info`,
    fetcher,
  );

  const { contains } = useFilter({ sensitivity: "base" });

  const onRemoveTags = (keys: Set<Key>) => {
    // from heroUI docs
    setSelectedUsers((prev) => prev.filter((key) => !keys.has(key)));
  };

  function handleChangeStatusFilter(newValue: string) {
    //todo: debounce search
    setStatusFilter(newValue);
  }

  return (
    <div className="flex w-full text-sm flex-1 min-h-0">
      <div
        ref={sidebarRef}
        onScroll={(e) => {
          savedSidebarScrollTop = e.currentTarget.scrollTop; // this was also Claude
        }}
        className="flex flex-col gap-2 w-1/2 h-full overflow-scroll border-r border-accent-background relative"
      >
        <div className="bg-background px-4 py-2 flex flex-col gap-1 sticky top-0 z-10">
          <div className="flex gap-2 items-center">
            <SearchIcon width={16} />
            <Input
              type="text"
              className="w-full"
              placeholder="Search by name or ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <ToggleButton isSelected={showFilters} onChange={setShowFilters}>
              {showFilters ? (
                <ChevronUpIcon width={16} />
              ) : (
                <ChevronDownIcon width={16} />
              )}
              Filters
            </ToggleButton>
          </div>
          {showFilters && (
            <div className="flex flex-col gap-1 border-b border-accent-background pb-2">
              <Autocomplete
                placeholder="Select assignees"
                selectionMode="multiple"
                value={selectedUsers}
                onChange={(keys: Key | Key[] | null) =>
                  setSelectedUsers(keys as Key[])
                }
              >
                <Label>Assignees</Label>
                <Autocomplete.Trigger>
                  <Autocomplete.Value>
                    {({ defaultChildren, isPlaceholder, state }: any) => {
                      if (isPlaceholder || state.selectedItems.length === 0) {
                        return defaultChildren;
                      }
                      const selectedItemsKeys = state.selectedItems.map(
                        (item: any) => item.key,
                      );
                      return (
                        <TagGroup size="sm" onRemove={onRemoveTags}>
                          <TagGroup.List>
                            {selectedItemsKeys.map((selectedItemKey: Key) => {
                              const item = program?.assignedUsers.find(
                                (s) => s.id === selectedItemKey,
                              );
                              if (!item) return null;
                              return (
                                <Tag key={item.id} id={item.id}>
                                  {item.username}
                                </Tag>
                              );
                            })}
                          </TagGroup.List>
                        </TagGroup>
                      );
                    }}
                  </Autocomplete.Value>
                  <Autocomplete.Indicator />
                </Autocomplete.Trigger>
                <Autocomplete.Popover>
                  <Autocomplete.Filter filter={contains}>
                    <SearchField autoFocus name="search" variant="secondary">
                      <SearchField.Group>
                        <SearchField.SearchIcon />
                        <SearchField.Input placeholder="Search..." />
                        <SearchField.ClearButton />
                      </SearchField.Group>
                    </SearchField>
                    <ListBox
                      renderEmptyState={() => (
                        <EmptyState>No results found</EmptyState>
                      )}
                    >
                      {program &&
                        !programError &&
                        !programIsLoading &&
                        program?.assignedUsers.map((user) => (
                          <ListBox.Item
                            key={user.id}
                            id={user.id}
                            textValue={user.username}
                          >
                            {user.username}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                    </ListBox>
                  </Autocomplete.Filter>
                </Autocomplete.Popover>
              </Autocomplete>
              <Select
                onChange={(e) =>
                  handleChangeStatusFilter(e?.toString() as string)
                }
                value={statusFilter}
                className="w-1/2"
              >
                <Label>Status</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    <ListBox.Item id="0,1,2" value="0,1,2">
                      All statuses
                    </ListBox.Item>
                    <ListBox.Item id="0" value="0">
                      Open
                    </ListBox.Item>
                    <ListBox.Item id="1" value="1">
                      Assigned
                    </ListBox.Item>
                    <ListBox.Item id="2" value="2">
                      Resolved
                    </ListBox.Item>
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>
          )}
          {programTickets && (
            <p className="text-muted">
              {programTickets.length} result{programTickets.length !== 1 && "s"}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 px-4 py-2">
          {((!programTickets || programTicketsIsLoading) && !programTicketsError) && (
            <div className="flex justify-center items-center w-full h-full">
              <Spinner />
            </div>
          )}
          {(!programTickets || programTicketsIsLoading) && (
            <div className="flex justify-center items-center w-full h-full">
              <p className="text-muted">Problem fetching tickets</p>
            </div>
          )}
          {programTickets &&
            !programTicketsIsLoading &&
            !programTicketsError &&
            programTickets.map((ticket) => (
              <Link
                href={`/programs/${ticket.programId}/ticket/${ticket.id}`}
                key={ticket.id}
                scroll={false}
              >
                <Card
                  className={`flex flex-row gap-2 items-center border-l-4 ${ticket.status === 0 && "border-orange-700"} ${ticket.status === 1 && "border-blue-700"} ${ticket.status === 2 && "border-green-700"}`}
                >
                  <Avatar size="sm">
                    <Avatar.Image
                      src={`https://cachet.dunkirk.sh/users/${ticket.slackUser.id}/r`}
                      alt="Profile picture"
                    />
                    <Avatar.Fallback>
                      {ticket.slackUser.username.substring(0, 1)}
                    </Avatar.Fallback>
                  </Avatar>
                  <div className="flex flex-col gap-1">
                    {getShortTitle(ticket.message)}
                    <div className="text-muted">
                      {ticket.slackUser.username} - Opened{" "}
                      {new Date(ticket.dateCreated).toLocaleDateString()} -{" "}
                      {ticket.replies.length} repl
                      {ticket.replies.length === 1 ? "y" : "ies"}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
        </div>
      </div>
      <div className="flex flex-col p-4 gap-4 w-full h-full overflow-scroll">
        {children}
      </div>
    </div>
  );
}
