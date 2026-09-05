"use client";

import { createProgram } from "@/app/lib/actions";
import {
  Button,
  Description,
  Input,
  Label,
  Switch,
  TextField,
} from "@heroui/react";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import ProgramLogoUpload from "./program-logo-upload";

export default function AddProgramUI() {
  const [programName, setProgramName] = useState("");
  const [imageLink, setImageLink] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [channelId, setChannelId] = useState("");
  const [resolveKeyword, setResolveKeyword] = useState("");
  const [autoIndex, setAutoIndex] = useState(true);
  function handleAddProgram() {
    createProgram(
      programName,
      channelId,
      autoIndex,
      imageFile,
      imageLink,
      resolveKeyword,
    );
  }

  return (
    <div className="flex flex-col gap-2 px-12 py-4 w-full h-full">
      <h2 className="text-lg font-bold">Add Program</h2>
      <TextField type="text">
        <Label htmlFor="programName">Program name</Label>
        <Input
          value={programName}
          onChange={(e) => setProgramName(e.target.value)}
        />
      </TextField>
      <ProgramLogoUpload
        url={imageLink || null}
        file={imageFile}
        onChange={({ url, file }) => {
          setImageLink(url ?? "");
          setImageFile(file);
        }}
        label="Icon"
      />
      <TextField type="text">
        <Label htmlFor="programName">Resolve keyword</Label>
        <Description>
          This should be a keyword found in your support bot&apos;s message when
          a ticket is resolved.
        </Description>
        <Input
          value={resolveKeyword}
          onChange={(e) => setResolveKeyword(e.target.value)}
        />
      </TextField>
      <TextField type="text">
        <Label htmlFor="programName">Channel ID</Label>
        <Description>
          Unified Help will use this channel ID to index tickets and for ticket
          links. Be careful when changing this. Make sure that the UHSBot is
          invited into the channel.
        </Description>
        <Input
          value={channelId}
          onChange={(e) => setChannelId(e.target.value)}
          className="font-mono"
        />
      </TextField>
      <Switch isSelected={autoIndex} onChange={setAutoIndex}>
        <Switch.Content>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          Enable automatic ticket indexing
        </Switch.Content>
      </Switch>
      <Button onClick={handleAddProgram}>
        <PlusIcon /> Add program
      </Button>
    </div>
  );
}
