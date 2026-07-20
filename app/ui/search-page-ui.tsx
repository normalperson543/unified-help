"use client";

import { SearchIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { ProgramTicketsResponse, SlackUserApiResponse } from "../lib/types";
import useSWR from "swr";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import {
  Alert,
  Autocomplete,
  EmptyState,
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
  const { searchTerm } = useParams();
  const [search, setSearch] = useState("");
  const [searchDebounced] = useDebounce(search, 500);
  const [statusFilter, setStatusFilter] = useState("0,1,2");
  const [statusFilterDebounced] = useDebounce(statusFilter, 500);
  const [selectedUsers, setSelectedUsers] = useState<Key[]>([]);
  const [selectedUsersDebounced] = useDebounce(selectedUsers, 500);
  const [sort, setSort] = useState("desc");
  const [sortDebounced] = useDebounce(sort, 500);
  const [page, setPage] = useState(1);
  const {
    data: programTickets,
    error: programTicketsError,
    isLoading: programTicketsIsLoading,
  } = useSWR<ProgramTicketsResponse>(
    `/api/programs/all/?searchTerm=${encodeURIComponent(searchDebounced)}&assigneeIds=${(selectedUsersDebounced as string[]).join(",")}&statuses=${statusFilterDebounced}&order=${sortDebounced}&page=${page}`,
    fetcher,
    { keepPreviousData: true },
  );
  const {
    data: users,
    error: usersError,
    isLoading: usersIsLoading,
  } = useSWR<SlackUserApiResponse>(
    `/api/users/?searchTerm=${encodeURIComponent(searchDebounced)}&order=${sortDebounced}&page=${page}`,
    fetcher,
    { keepPreviousData: true },
    );

  console.log(users)

  let totalPages = 1;

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

  if (programTickets?.total) {
    totalPages = Math.floor(programTickets.total / 20) + 1;
  }
  return (
    <div className="flex flex-col gap-6 px-36 py-4 flex-1 min-h-0 overflow-y-auto">
      <div className="flex gap-4 items-center">
        <SearchIcon width={32} />
        <p className="font-bold text-2xl">Global Search</p>
      </div>
      <div className="flex justify-between items-center">
        <p className="font-bold text-xl">Users</p>
        <div className="flex gap-2 items-center">
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
      {users && <UsersTable users={users.users} />}
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
      {programTickets && (
        <Pagination className="w-full">
          {" "}
          {/* from heroUI docs */}
          <Pagination.Summary>
            Showing {startItem}-{endItem} of {programTickets.total ?? 0} results
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
