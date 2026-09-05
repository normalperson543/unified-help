"use client";

import { createManagedProgram } from "@/app/lib/actions";
import {
  Button,
  Card,
  Description,
  Input,
  Label,
  TextArea,
  TextField,
} from "@heroui/react";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import ProgramLogoUpload from "./program-logo-upload";

export default function AddProgramUI() {
  const [programName, setProgramName] = useState("");
  const [imageLink, setImageLink] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [helpChannelId, setHelpChannelId] = useState("");
  const [orgChannelId, setOrgChannelId] = useState("");
  const [createMessage, setCreateMessage] = useState("");
  const [resolveMessage, setResolveMessage] = useState("");
  const [supportBotName, setSupportBotName] = useState("");
  function handleAddProgram() {
    createManagedProgram(
      programName,
      helpChannelId,
      orgChannelId,
      imageFile,
      imageLink,
      createMessage,
      resolveMessage,
      supportBotName,
    );
  }

  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="flex flex-col gap-2 px-12 py-4 w-1/2 h-full">
        <h2 className="text-lg font-bold">Start a new program</h2>
        <p>Let&apos;s get you started with Unified Help</p>
        <Card>
          <TextField type="text" variant="secondary">
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
            label="Program icon"
          />
          <TextField type="text" variant="secondary">
            <Label htmlFor="programName">Support bot name</Label>
            <Input
              value={supportBotName}
              onChange={(e) => setSupportBotName(e.target.value)}
            />
          </TextField>
          <div className="flex gap-2 w-full">
            <TextField type="text" variant="secondary">
              <Label htmlFor="programName">Help channel ID</Label>
              <Description>
                Unified Help will use this channel ID to index tickets and for
                ticket links. Make sure that the UHSBot isinvited into the
                channel.
              </Description>
              <Input
                value={helpChannelId}
                onChange={(e) => setHelpChannelId(e.target.value)}
                className="font-mono"
              />
            </TextField>
            <TextField type="text" variant="secondary">
              <Label htmlFor="programName">Organizer channel ID</Label>
              <Description>
                Anyone in this channel will automatically be added as a helper.
                Note that users removed from this channel will not be removed in
                Unified Help.
              </Description>
              <Input
                value={orgChannelId}
                onChange={(e) => setOrgChannelId(e.target.value)}
                className="font-mono"
              />
            </TextField>
          </div>
          <TextField type="text" variant="secondary">
            <Label htmlFor="programName">Ticket creation message</Label>
            <Description>
              Unified Help will reply with this message whenever a new ticket is
              created. You may use Block Kit to write this message. Use{" "}
              {`{USERNAME}`} to mention the creator in this message.
            </Description>
            <TextArea
              value={createMessage}
              onChange={(e) => setCreateMessage(e.target.value)}
            />
          </TextField>
          <TextField type="text" variant="secondary">
            <Label htmlFor="programName">Ticket resolve message</Label>
            <Description>
              Unified Help will reply with this message whenever a ticket is
              resolved. You may use Block Kit to write this message. Use{" "}
              {`{USERNAME}`} to mention the resolver in this message.
            </Description>
            <TextArea
              value={resolveMessage}
              onChange={(e) => setResolveMessage(e.target.value)}
            />
          </TextField>
          <Button onClick={handleAddProgram}>
            <PlusIcon /> Add program
          </Button>
        </Card>
      </div>
    </div>
  );
}
