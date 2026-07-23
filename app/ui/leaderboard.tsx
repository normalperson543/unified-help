"use client";
import { Alert, Pagination, SortDescriptor, Spinner } from "@heroui/react";
import UsersTable from "../ui/users-table";
import { SlackUserApiResponse } from "../lib/types";
import useSWR from "swr";
import { fetcher } from "../lib/swr";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import { ITEMS_PER_PAGE } from "../lib/constants";
import { PodiumIcon } from "lucide-react";

export default function LeaderboardUI() {
  const [usersPage, setUsersPage] = useState(1);
  const [userSortDescriptor, setUserSortDescriptor] = useState<SortDescriptor>({
    column: "resolvedTickets",
    direction: "descending",
  });
  const [usersSortDebounced] = useDebounce(userSortDescriptor, 500);
  const usersOrder = `${usersSortDebounced.column}.${
    usersSortDebounced.direction === "ascending" ? "asc" : "desc"
  }`;
  const {
    data: users,
    error: usersError,
    isLoading: usersIsLoading,
  } = useSWR<SlackUserApiResponse>(
    `/api/users/?order=${usersOrder}&page=${usersPage}`,
    fetcher,
    { keepPreviousData: true },
  );

  let totalUsersPages = 1;

  if (users?.total) {
    totalUsersPages = Math.ceil(users.total / ITEMS_PER_PAGE);
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
  const startUserItem = (usersPage - 1) * ITEMS_PER_PAGE + 1;
  const endUserItem = Math.min(usersPage * ITEMS_PER_PAGE, users?.total ?? 0);

  function handleSetUserSortDescriptor(newSortDescriptor: SortDescriptor) {
    setUserSortDescriptor(newSortDescriptor);
    setUsersPage(1);
  }

  return (
    <div className="flex flex-col gap-6 px-36 py-4 flex-1 min-h-0 overflow-y-auto">
      <div className="flex gap-4 items-center">
        <PodiumIcon width={32} />
        <p className="font-bold text-2xl">Global Leaderboard</p>
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
          height={120}
        />
      )}
    </div>
  );
}
