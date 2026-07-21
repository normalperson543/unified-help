"use client";

import { SearchIcon } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { ProgramTicketsResponse, SlackUserApiResponse } from "../lib/types";
import useSWR from "swr";
import { useRef, useState } from "react";
import { useDebounce, useDebouncedCallback } from "use-debounce";
import {
  Alert,
  Autocomplete,
  EmptyState,
  Input,
  Key,
  Label,
  ListBox,
  Pagination,
  SearchField,
  Select,
  Spinner,
  Table,
  TagGroup,
} from "@heroui/react";
import { fetcher } from "../lib/swr";
import { ITEMS_PER_PAGE } from "../lib/constants";
import TicketTable from "./ticket-table";
import UsersTable from "./users-table";

export default function SearchPageUI() {
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("searchTerm") ?? "");
  const [searchDebounced, setSearchDebounced] = useState(search);
  const [statusFilter, setStatusFilter] = useState("0,1,2");
  const [statusFilterDebounced] = useDebounce(statusFilter, 500);
  const [selectedUsers, setSelectedUsers] = useState<Key[]>([]);
  const [selectedUsersDebounced] = useDebounce(selectedUsers, 500);
  const [sort, setSort] = useState("desc");
  const [sortDebounced] = useDebounce(sort, 500);
  const [ticketsPage, setTicketsPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const {
    data: programTickets,
    error: programTicketsError,
    isLoading: programTicketsIsLoading,
  } = useSWR<ProgramTicketsResponse>(
    `/api/programs/all/?searchTerm=${encodeURIComponent(searchDebounced)}&assigneeIds=${(selectedUsersDebounced as string[]).join(",")}&statuses=${statusFilterDebounced}&order=${sortDebounced}&page=${ticketsPage}`,
    fetcher,
    { keepPreviousData: true },
  );
  const {
    data: users,
    error: usersError,
    isLoading: usersIsLoading,
  } = useSWR<SlackUserApiResponse>(
    `/api/users/?searchTerm=${encodeURIComponent(searchDebounced)}&order=${sortDebounced}&page=${usersPage}`,
    fetcher,
    { keepPreviousData: true },
  );

  console.log(users);

  let totalPages = 1;

  if (programTickets?.total) {
    totalPages = Math.floor(programTickets.total / 20) + 1;
  }

  function handleLoadMore() {
    if (usersIsLoading) return;
    setUsersPage(usersPage + 1);
  }

  const handleSearch = useDebouncedCallback(() => {
    setSearchDebounced(search);
    setUsersPage(1);
  }, 500);
  function handleChangeSearchTerm(newTerm: string) {
    setSearch(newTerm);
    handleSearch();
  }
  return (
    <div className="flex flex-col gap-6 px-36 py-4 flex-1 min-h-0 overflow-y-auto">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <SearchIcon width={32} />
          <p className="font-bold text-2xl">Global Search</p>
        </div>
        <Input
          value={search}
          onChange={(e) => handleChangeSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex justify-between items-center">
        <p className="font-bold text-xl">Users</p>
      </div>
      <p>{usersPage}</p>
      {users && (
        <UsersTable
          users={users.users}
          total={users.total}
          onLoadMore={handleLoadMore}
          isLoading={usersIsLoading}
        />
      )}
      <div className="flex justify-between items-center">
        <p className="font-bold text-xl">Tickets</p>
        <div className="flex gap-2 items-center">
          <Select
            onChange={(e) => setStatusFilter(e?.toString() as string)}
            value={statusFilter}
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
            onChange={(e) => setSort(e?.toString() as string)}
            value={sort}
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
      <div className="flex flex-col gap-2 px-4 py-2">
        {(!programTickets || programTicketsIsLoading) &&
          !programTicketsError && (
            <div className="flex justify-center items-center w-full h-full">
              <Spinner />
            </div>
          )}
        {programTicketsError && (
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
        {programTickets && !programTicketsIsLoading && !programTicketsError && (
          <TicketTable tickets={programTickets.tickets} />
        )}
      </div>
    </div>
  );
}
