"use client";
import { ComboBox, Input, Key, ListBox, Spinner } from "@heroui/react";
import useSWR from "swr";
import { Program } from "@/generated/prisma/client";
import { fetcher } from "../lib/swr";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";

function normalizeProgramId( // AI generated function for bugfix
  programId: string | string[] | undefined,
): Key | null {
  if (!programId) return null;
  const id = Array.isArray(programId) ? programId[0] : programId;
  return id || null;
}

export default function ProgramSelector() {
  const {
    data: programs,
    error: programsError,
    isLoading: programsIsLoading,
  } = useSWR<Program[]>(`/api/programs/list`, fetcher);
  const params = useParams();
  const selectedKey = normalizeProgramId(params.programId);

  const router = useRouter();

  if (programsError) return;
  if (!programs) return <Spinner />;

  function handleSelectProgram(key: Key | null) {
    if (!key) return;
    router.push(`/programs/${key}`);
  }
  return (
    <ComboBox
      selectedKey={selectedKey}
      onSelectionChange={(key) => handleSelectProgram(key)}
    >
      <ComboBox.InputGroup>
        <Input placeholder="Search programs..." />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover>
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
      </ComboBox.Popover>
    </ComboBox>
  );
}
