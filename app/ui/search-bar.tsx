"use client";

import { Input } from "@heroui/react";
import { SearchIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SearchBar() {
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("searchTerm") ?? "");
  const { replace } = useRouter();

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const newParams = new URLSearchParams(params);
      if (search && search.length > 0) {
        newParams.set("searchTerm", search);
      } else {
        newParams.delete("searchTerm");
      }
      replace(`/search/?${newParams.toString()}`);
    }
  }
  return (
    <div className="flex items-center gap-2">
      <SearchIcon width={16} />
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={onKeyDown}
      />
    </div>
  );
}
