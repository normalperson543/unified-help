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
  SortDescriptor,
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
  const [dateSort, setDateSort] = useState("desc");
  const [ticketsPage, setTicketsPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [userSortDescriptor, setUserSortDescriptor] = useState<SortDescriptor>({
    column: "resolvedTickets",
    direction: "descending",
  });
  const [ticketSortDescriptor, setTicketSortDescriptor] =
    useState<SortDescriptor>({
      column: "dateCreated",
      direction: "ascending",
    });
  const [usersSortDebounced] = useDebounce(userSortDescriptor, 500);
  const [ticketsSortDebounced] = useDebounce(ticketSortDescriptor, 500);

  const usersOrder = `${usersSortDebounced.column}.${
    usersSortDebounced.direction === "ascending" ? "asc" : "desc"
  }`;
  const ticketsOrder = `${ticketsSortDebounced.column}.${
    ticketsSortDebounced.direction === "ascending" ? "asc" : "desc"
  }`;
  const {
    data: programTickets,
    error: programTicketsError,
    isLoading: programTicketsIsLoading,
  } = useSWR<ProgramTicketsResponse>(
    `/api/programs/all/?searchTerm=${encodeURIComponent(searchDebounced)}&assigneeIds=${(selectedUsersDebounced as string[]).join(",")}&statuses=${statusFilterDebounced}&page=${ticketsPage}&order=${ticketsOrder}`,
    fetcher,
    { keepPreviousData: true },
  );
  const {
    data: users,
    error: usersError,
    isLoading: usersIsLoading,
  } = useSWR<SlackUserApiResponse>(
    `/api/users/?searchTerm=${encodeURIComponent(searchDebounced)}&order=${usersOrder}&page=${usersPage}`,
    fetcher,
    { keepPreviousData: true },
  );

  console.log(users);

  let totalUsersPages = 1;

  if (users?.total) {
    totalUsersPages = Math.ceil(users.total / ITEMS_PER_PAGE);
  }

  const getPageNumbers = () => {
    // from heroui docs
    const pages: (number | "ellipsis")[] = [];
    pages.push(1);
    if (usersPage > 3) {
      pages.push("ellipsis");
    }
    const start = Math.max(2, usersPage - 1);
    const end = Math.min(totalUsersPages - 1, usersPage + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (usersPage < totalUsersPages - 2) {
      pages.push("ellipsis");
    }
    if (totalUsersPages > 1) {
      pages.push(totalUsersPages);
    }
    return pages;
  };

  const startItem = (usersPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(usersPage * ITEMS_PER_PAGE, users?.total ?? 0);

  const handleSearch = useDebouncedCallback(() => {
    setSearchDebounced(search);
    setUsersPage(1);
  }, 500);
  function handleChangeSearchTerm(newTerm: string) {
    setSearch(newTerm);
    handleSearch();
  }

  function handleSetUserSortDescriptor(newSortDescriptor: SortDescriptor) {
    setUserSortDescriptor(newSortDescriptor);
    setUsersPage(1);
  }

  function handleSetTicketSortDescriptor(newSortDescriptor: SortDescriptor) {
    setTicketSortDescriptor(newSortDescriptor);
    setTicketsPage(1);
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
      {users && (
        <Pagination className="w-full">
          {" "}
          {/* from heroUI docs */}
          <Pagination.Summary>
            Showing {startItem}-{endItem} of {users.total ?? 0} results
          </Pagination.Summary>
          <Pagination.Content>
            <Pagination.Item>
              <Pagination.Previous
                isDisabled={usersPage === 1}
                onPress={() => setUsersPage((p) => p - 1)}
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
                    isActive={p === usersPage}
                    onPress={() => setUsersPage(p)}
                  >
                    {p}
                  </Pagination.Link>
                </Pagination.Item>
              ),
            )}
            <Pagination.Item>
              <Pagination.Next
                isDisabled={usersPage === totalUsersPages}
                onPress={() => setUsersPage((p) => p + 1)}
              >
                <span>Next</span>
                <Pagination.NextIcon />
              </Pagination.Next>
            </Pagination.Item>
          </Pagination.Content>
        </Pagination>
      )}
      <p>{usersPage}</p>
      {users && (
        <UsersTable
          users={users.users}
          sortDescriptor={userSortDescriptor}
          setSortDescriptor={handleSetUserSortDescriptor}
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
            onChange={(e) => setDateSort(e?.toString() as string)}
            value={dateSort}
          >
            <Label>Sort date by</Label>
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
          <TicketTable
            tickets={programTickets.tickets}
            sortDescriptor={ticketSortDescriptor}
            setSortDescriptor={handleSetTicketSortDescriptor}
          />
        )}
      </div>
    </div>
  );
}
