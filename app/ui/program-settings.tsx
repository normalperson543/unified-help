"use client";

import { Program } from "@/generated/prisma/client";
import { Button, Input, Label } from "@heroui/react";
import { SaveIcon } from "lucide-react";
import { useState } from "react";

export default function ProgramSettings({ program }: { program: Program }) {
  const [programName, setProgramName] = useState(program.name);
  return (
    <div className="flex flex-col gap-4 p-4 w-full h-full">
      <h2 className="text-lg font-bold">Settings for {program?.name}</h2>
      <div className="flex flex-col gap-1">
        <Label htmlFor="programName">Program name</Label>
        <Input
          type="text"
          id="programName"
          value={programName}
          onChange={(e) => setProgramName(e.target.value)}
        />
      </div>
      <Button>
        <SaveIcon /> Save changes
      </Button>
    </div>
  );
}
