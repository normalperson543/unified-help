"use client";
import { Label, ListBox, Select, Spinner } from "@heroui/react";
import useSWR from "swr";
import { Program } from "@/generated/prisma/client";
import { fetcher } from "../lib/swr";
import Image from "next/image";

export default function ProgramSelector() {
  const {
    data: programs,
    error: programsError,
    isLoading: programsIsLoading,
  } = useSWR<Program[]>(`/api/programs`, fetcher);
  if (!programs) return <Spinner />;
  return (
    <Select>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {programs.map((p) => (
            <ListBox.Item id={p.id} textValue={p.name} key={p.id}>
              <div className="flex flex-row items-center gap-2">
                {p.logo && (
                  <Image
                    src={p.logo}
                    alt="Program logo"
                    width={16}
                    height={16}
                    className="rounded-sm"
                  />
                )}
                {p.name}
              </div>
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
