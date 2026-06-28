"use client";
import { Label, ListBox, Select, Spinner } from "@heroui/react";
import useSWR from "swr";
import { Program } from "@/generated/prisma/client";
import { fetcher } from "../lib/swr";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";

export default function ProgramSelector() {
  const {
    data: programs,
    error: programsError,
    isLoading: programsIsLoading,
  } = useSWR<Program[]>(`/api/programs`, fetcher);

  const router = useRouter();
  const { programId } = useParams();

  if (programsError) return;
  if (!programs) return <Spinner />;

  function handleSelectProgram(id: string) {
    router.push(`/programs/${id}`);
  }
  return (
    <Select
      onChange={(e) => handleSelectProgram(e?.toString() as string)}
      value={(programId as string) ?? ""}
    >
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {!programsIsLoading &&
            programs &&
            programs.map((p) => (
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
