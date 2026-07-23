"use client";

import { fetcher } from "@/app/lib/swr";
import { getShortTitle } from "@/app/lib/tools";
import { ProgramTicketsResponse, ProgramWithAssignees } from "@/app/lib/types";
import {
  Alert,
  Autocomplete,
  Avatar,
  Card,
  EmptyState,
  Input,
  Key,
  Label,
  ListBox,
  Pagination,
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
import { ITEMS_PER_PAGE } from "@/app/lib/constants";
import { useDebounce } from "use-debounce";
let savedSidebarScrollTop = 0;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const params = useParams();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermDebounced] = useDebounce(searchTerm, 500);
  const [statusFilter, setStatusFilter] = useState("0,1,2");
  const [statusFilterDebounced] = useDebounce(statusFilter, 500);
  const [selectedUsers, setSelectedUsers] = useState<Key[]>([]);
  const [selectedUsersDebounced] = useDebounce(selectedUsers, 500);
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState("desc");
  const [sortDebounced] = useDebounce(sort, 500);
  const [page, setPage] = useState(1);

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
  } = useSWR<ProgramTicketsResponse>(
    `/api/programs/${params.programId}/?searchTerm=${encodeURIComponent(searchTermDebounced)}&assigneeIds=${selectedUsersDebounced.join(",")}&statuses=${statusFilterDebounced}&order=${sortDebounced}&page=${page}`,
    fetcher,
    { keepPreviousData: true },
  );

  const {
    data: program,
    error: programError,
    isLoading: programIsLoading,
  } = useSWR<ProgramWithAssignees>(
    `/api/programs/${params.programId}/info`,
    fetcher,
  );
  let totalPages = 1;

  if (programTickets?.total) {
    totalPages = Math.floor(programTickets.total / 20) + 1;
  }

  const { contains } = useFilter({ sensitivity: "base" });

  const onRemoveTags = (keys: Set<Key>) => {
    // from heroUI docs
    setSelectedUsers((prev) => prev.filter((key) => !keys.has(key)));
  };

  function handleChangeStatusFilter(newValue: string) {
    //todo: debounce search
    setStatusFilter(newValue);
  }
  function handleChangeSort(newValue: string) {
    //todo: debounce search
    setSort(newValue);
  }

  const getPageNumbers = () => {
    // from heroui docs
    const pages: (number | "ellipsis")[] = [];
    pages.push(1);
    if (page > 3) {
      pages.push("ellipsis");
    }
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) {
      pages.push("ellipsis");
    }
    pages.push(totalPages);
    return pages;
  };

  const startItem = (page - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(page * ITEMS_PER_PAGE, programTickets?.total ?? 0);

  return (
    <div className="flex w-full text-sm flex-1 min-h-0">
      <div
        ref={sidebarRef}
        onScroll={(e) => {
          savedSidebarScrollTop = e.currentTarget.scrollTop; // this was also Claude
        }}
        className="flex flex-col gap-2 w-1/2 min-h-0 overflow-y-auto border-r border-accent-background relative"
      >
        <div className="bg-background px-4 py-2 flex flex-col gap-1 sticky top-0 z-10">
          <div className="flex gap-2 items-center">
            <SearchIcon width={16} />
            <Input
              type="text"
              className="w-full"
              placeholder="Search by name"
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
                onChange={(keys) => setSelectedUsers(keys)}
              >
                <Label>Assignees</Label>
                <Autocomplete.Trigger>
                  <Autocomplete.Value>
                    {({
                      defaultChildren,
                      isPlaceholder,
                      state,
                    }: {
                      defaultChildren?: React.ReactNode;
                      isPlaceholder: boolean;
                      state: { selectedItems: readonly { key: Key }[] };
                    }) => {
                      if (isPlaceholder || state.selectedItems.length === 0) {
                        return defaultChildren;
                      }
                      const selectedItemsKeys = state.selectedItems.map(
                        (item) => item.key,
                      );
                      return (
                        <TagGroup size="sm" onRemove={onRemoveTags}>
                          <TagGroup.List>
                            {selectedItemsKeys.map((selectedItemKey) => {
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
              <div className="flex gap-4">
                <Select
                  onChange={(key) => {
                    if (key !== null) handleChangeStatusFilter(String(key));
                  }}
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
                <Select
                  onChange={(key) => {
                    if (key !== null) handleChangeSort(String(key));
                  }}
                  value={sort}
                  className="w-1/2"
                >
                  <Label>Sort by</Label>
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      <ListBox.Item id="asc" value="asc">
                        Ascending
                      </ListBox.Item>
                      <ListBox.Item id="desc" value="desc">
                        Descending
                      </ListBox.Item>
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>
            </div>
          )}
          {programTickets && (
            <Pagination className="w-full">
              {" "}
              {/* from heroUI docs */}
              <Pagination.Summary>
                Showing {startItem}-{endItem} of {programTickets.total ?? 0}{" "}
                results
              </Pagination.Summary>
              <Pagination.Content>
                <Pagination.Item>
                  <Pagination.Previous
                    isDisabled={page === 1}
                    onPress={() => setPage((p) => p - 1)}
                  >
                    <Pagination.PreviousIcon />
                    <span>Previous</span>
                  </Pagination.Previous>
                </Pagination.Item>
                {getPageNumbers().map((p, i) =>
                  p === "ellipsis" ? (
                    <Pagination.Item key={`ellipsis-${i}`}>
                      <Pagination.Ellipsis />
                    </Pagination.Item>
                  ) : (
                    <Pagination.Item key={p}>
                      <Pagination.Link
                        isActive={p === page}
                        onPress={() => setPage(p)}
                      >
                        {p}
                      </Pagination.Link>
                    </Pagination.Item>
                  ),
                )}
                <Pagination.Item>
                  <Pagination.Next
                    isDisabled={page === totalPages}
                    onPress={() => setPage((p) => p + 1)}
                  >
                    <span>Next</span>
                    <Pagination.NextIcon />
                  </Pagination.Next>
                </Pagination.Item>
              </Pagination.Content>
            </Pagination>
          )}
        </div>
        <div className="flex flex-col gap-2 px-4 py-2">
          {(!programTickets || programTicketsIsLoading) &&
            !programTicketsError && (
              <div className="flex justify-center items-center w-full h-full">
                <Spinner />
              </div>
            )}
          {programError && (
            <Alert status="danger">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>
                  There was a problem fetching these tickets
                </Alert.Title>
                <Alert.Description>
                  Please try again by refreshing.
                </Alert.Description>
              </Alert.Content>
            </Alert>
          )}
          {programTickets &&
            !programTicketsIsLoading &&
            !programTicketsError &&
            programTickets.tickets.map((ticket) => (
              <Link
                href={`/programs/${ticket.programId}/ticket/${ticket.id}`}
                key={ticket.id}
                scroll={false}
              >
                <Card
                  className={`flex flex-row gap-2 items-center border-l-4 ${ticket.status === 0 && "border-orange-700"} ${ticket.status === 1 && "border-blue-700"} ${ticket.status === 2 && "border-green-700"}`}
                  variant={
                    params.ticketId === ticket.id ? "secondary" : "default"
                  }
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
                      {ticket._count.replies} repl
                      {ticket._count.replies === 1 ? "y" : "ies"}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
        </div>
      </div>
      <div className="flex flex-col gap-4 w-full min-h-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
