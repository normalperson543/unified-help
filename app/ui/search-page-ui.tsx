"use client";

import { SearchIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ProgramTicketsResponse, SlackUserApiResponse } from "../lib/types";
import useSWR from "swr";
import { useState } from "react";
import { useDebounce, useDebouncedCallback } from "use-debounce";
import {
  Alert,
  Input,
  Pagination,
  SortDescriptor,
  Spinner,
} from "@heroui/react";
import { fetcher } from "../lib/swr";
import { ITEMS_PER_PAGE } from "../lib/constants";
import TicketTable from "./ticket-table";
import UsersTable from "./users-table";

export default function SearchPageUI() {
  const params = useSearchParams();
  const urlSearchTerm = params.get("searchTerm") ?? "";
  const [search, setSearch] = useState(urlSearchTerm);
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

  // claude code bugfix
  const [prevSearchTerm, setPrevSearchTerm] = useState(urlSearchTerm);
  if (urlSearchTerm !== prevSearchTerm) {
    setPrevSearchTerm(urlSearchTerm);
    setSearch(urlSearchTerm);
    setUsersPage(1);
    setTicketsPage(1);
  }
  // end of claude code bugfix

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
    `/api/programs/all/?searchTerm=${encodeURIComponent(urlSearchTerm)}&page=${ticketsPage}&order=${ticketsOrder}`,
    fetcher,
    { keepPreviousData: true },
  );
  const {
    data: users,
    error: usersError,
    isLoading: usersIsLoading,
  } = useSWR<SlackUserApiResponse>(
    `/api/users/?searchTerm=${encodeURIComponent(urlSearchTerm)}&order=${usersOrder}&page=${usersPage}`,
    fetcher,
    { keepPreviousData: true },
  );

  const { replace } = useRouter();
  const pathname = usePathname();

  let totalUsersPages = 1;

  if (users?.total) {
    totalUsersPages = Math.ceil(users.total / ITEMS_PER_PAGE);
  }

  let totalTicketPages = 1;

  if (programTickets?.total) {
    totalTicketPages = Math.ceil(programTickets.total / ITEMS_PER_PAGE);
  }

  const getUserPageNumbers = () => {
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

  const getTicketPageNumbers = () => {
    // from heroui docs
    const pages: (number | "ellipsis")[] = [];
    pages.push(1);
    if (usersPage > 3) {
      pages.push("ellipsis");
    }
    const start = Math.max(2, usersPage - 1);
    const end = Math.min(totalTicketPages - 1, usersPage + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (usersPage < totalTicketPages - 2) {
      pages.push("ellipsis");
    }
    if (totalTicketPages > 1) {
      pages.push(totalTicketPages);
    }
    return pages;
  };

  const startUserItem = (usersPage - 1) * ITEMS_PER_PAGE + 1;
  const endUserItem = Math.min(usersPage * ITEMS_PER_PAGE, users?.total ?? 0);

  const startTicketItem = (ticketsPage - 1) * ITEMS_PER_PAGE + 1;
  const endTicketItem = Math.min(
    ticketsPage * ITEMS_PER_PAGE,
    programTickets?.total ?? 0,
  );

  const handleSearch = useDebouncedCallback(() => {
    const newParams = new URLSearchParams(params);
    if (search && search.length > 0) {
      newParams.set("searchTerm", search);
    } else {
      newParams.delete("searchTerm");
    }
    replace(`${pathname}?${newParams.toString()}`);
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
            Showing {startUserItem}-{endUserItem} of {users.total ?? 0} results
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
            {getUserPageNumbers().map((p, i) =>
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
      {(!users || usersIsLoading) && !usersError && (
        <div className="flex justify-center items-center w-full h-full">
          <Spinner />
        </div>
      )}
      {usersError && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>There was a problem fetching these users</Alert.Title>
            <Alert.Description>
              Please try again by refreshing.
            </Alert.Description>
          </Alert.Content>
        </Alert>
      )}
      {users && (
        <UsersTable
          users={users.users}
          sortDescriptor={userSortDescriptor}
          setSortDescriptor={handleSetUserSortDescriptor}
        />
      )}
      <div className="flex justify-between items-center">
        <p className="font-bold text-xl">Tickets</p>
      </div>

      {programTickets && (
        <Pagination className="w-full">
          {" "}
          {/* from heroUI docs */}
          <Pagination.Summary>
            Showing {startTicketItem}-{endTicketItem} of{" "}
            {programTickets?.total ?? 0} results
          </Pagination.Summary>
          <Pagination.Content>
            <Pagination.Item>
              <Pagination.Previous
                isDisabled={ticketsPage === 1}
                onPress={() => setTicketsPage((p) => p - 1)}
              >
                <Pagination.PreviousIcon />
                <span>Previous</span>
              </Pagination.Previous>
            </Pagination.Item>
            {getTicketPageNumbers().map((p, i) =>
              p === "ellipsis" ? (
                <Pagination.Item key={`ellipsis-${i}`}>
                  <Pagination.Ellipsis />
                </Pagination.Item>
              ) : (
                <Pagination.Item key={p}>
                  <Pagination.Link
                    isActive={p === ticketsPage}
                    onPress={() => setUsersPage(p)}
                  >
                    {p}
                  </Pagination.Link>
                </Pagination.Item>
              ),
            )}
            <Pagination.Item>
              <Pagination.Next
                isDisabled={ticketsPage === totalTicketPages}
                onPress={() => setTicketsPage((p) => p + 1)}
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
