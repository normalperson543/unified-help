"use client";

import { createManagedProgram } from "@/app/lib/actions";
import {
  Button,
  Card,
  Description,
  FieldError,
  Input,
  Label,
  TextArea,
  TextField,
} from "@heroui/react";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import ProgramLogoUpload from "./program-logo-upload";

// start of AI generated stuff for data validation
type FormErrors = {
  programName?: string;
  supportBotName?: string;
  helpChannelId?: string;
  orgChannelId?: string;
  createMessage?: string;
  resolveMessage?: string;
};

function validateChannelId(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "Channel ID is required";
  if (!/^[CGD][A-Za-z0-9]{8,}$/.test(trimmed)) {
    return "Enter a valid Slack channel ID";
  }
}

function validateForm(values: {
  programName: string;
  supportBotName: string;
  helpChannelId: string;
  orgChannelId: string;
  createMessage: string;
  resolveMessage: string;
}): FormErrors {
  const errors: FormErrors = {};

  if (!values.programName.trim()) {
    errors.programName = "Program name is required";
  }

  if (!values.supportBotName.trim()) {
    errors.supportBotName = "Support bot name is required";
  }

  const helpChannelError = validateChannelId(values.helpChannelId);
  if (helpChannelError) {
    errors.helpChannelId = helpChannelError;
  }

  const orgChannelError = validateChannelId(values.orgChannelId);
  if (orgChannelError) {
    errors.orgChannelId = orgChannelError;
  }

  if (!values.createMessage.trim()) {
    errors.createMessage = "Ticket creation message is required";
  }

  if (!values.resolveMessage.trim()) {
    errors.resolveMessage = "Ticket resolve message is required";
  }

  return errors;
}
// end
export default function AddProgramUI() {
  const [programName, setProgramName] = useState("");
  const [imageLink, setImageLink] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [helpChannelId, setHelpChannelId] = useState("");
  const [orgChannelId, setOrgChannelId] = useState("");
  const [createMessage, setCreateMessage] = useState(
    "someone should be along to help you soon but in the mean time i suggest you read the faq <[YOUR FAQ LINK]|here> to make sure your question hasn't already been answered. if it has been, please hit the button below to mark it as resolved :D",
  );
  const [resolveMessage, setResolveMessage] = useState(
    "oh, oh! it looks like this post has been marked as resolved by {USERNAME}! if you have any more questions, please make a new post in <#[YOUR CHANNEL ID HERE]> and someone'll be happy to help you out! not me though, i'm just a silly racoon ^-^",
  );
  const [supportBotName, setSupportBotName] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  function handleAddProgram() {
    const nextErrors = validateForm({
      programName,
      supportBotName,
      helpChannelId,
      orgChannelId,
      createMessage,
      resolveMessage,
    });

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

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
    <div className="min-w-full min-h-full flex justify-center items-center">
      <div className="flex flex-col gap-2 px-12 py-4 w-1/2 h-full">
        <h2 className="text-lg font-bold">Deploy a new help channel</h2>
        <p>Let&apos;s get you started with Unified Help.</p>
        <Card>
          <div className="flex gap-2 items-start justify-start w-full">
            <div className="rounded-full bg-accent-soft flex items-center justify-center w-8 h-8 font-bold shrink-0">
              1
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="font-bold">Create your help channels</h2>
              <p>
                You&apos;ll need to create 2 channels - one that&apos;s your
                public facing support channel, and one channel that&apos;s for
                your program organizers. Make sure you have the channel IDs for
                these channels.
              </p>
            </div>
          </div>
          <div className="flex gap-2 items-start justify-start w-full">
            <div className="rounded-full bg-accent-soft flex items-center justify-center w-8 h-8 font-bold shrink-0">
              2
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="font-bold">Invite @UHSBot to both channels</h2>
              <p>
                Next, invite the @UHSBot to the channels so Unified Help can
                access tickets and member information.
              </p>
            </div>
          </div>
          <div className="flex gap-2 items-start justify-start w-full">
            <div className="rounded-full bg-accent-soft flex items-center justify-center w-8 h-8 font-bold shrink-0">
              3
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="font-bold">Complete the details below to finish setup</h2>
            </div>
          </div>
          <TextField
            type="text"
            variant="secondary"
            isInvalid={!!errors.programName}
          >
            <Label htmlFor="programName">Program name</Label>
            <Input
              id="programName"
              value={programName}
              onChange={(e) => {
                setProgramName(e.target.value);
                setErrors((prev) => ({ ...prev, programName: undefined }));
              }}
            />
            {errors.programName && (
              <FieldError>{errors.programName}</FieldError>
            )}
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
          <TextField
            type="text"
            variant="secondary"
            isInvalid={!!errors.supportBotName}
          >
            <Label htmlFor="supportBotName">Support bot name</Label>
            <Input
              id="supportBotName"
              value={supportBotName}
              onChange={(e) => {
                setSupportBotName(e.target.value);
                setErrors((prev) => ({ ...prev, supportBotName: undefined }));
              }}
            />
            {errors.supportBotName && (
              <FieldError>{errors.supportBotName}</FieldError>
            )}
          </TextField>
          <div className="flex gap-2 w-full">
            <TextField
              type="text"
              variant="secondary"
              isInvalid={!!errors.helpChannelId}
            >
              <Label htmlFor="helpChannelId">Help channel ID</Label>
              <Description>
                Unified Help will use this channel ID to index tickets and for
                ticket links. Make sure that the UHSBot is invited into the
                channel.
              </Description>
              <Input
                id="helpChannelId"
                value={helpChannelId}
                placeholder="C07TM4C0AQ5"
                onChange={(e) => {
                  setHelpChannelId(e.target.value);
                  setErrors((prev) => ({ ...prev, helpChannelId: undefined }));
                }}
                className="font-mono"
              />
              {errors.helpChannelId && (
                <FieldError>{errors.helpChannelId}</FieldError>
              )}
            </TextField>
            <TextField
              type="text"
              variant="secondary"
              isInvalid={!!errors.orgChannelId}
            >
              <Label htmlFor="orgChannelId">Organizer channel ID</Label>
              <Description>
                Anyone in this channel will automatically be added as a helper.
                Note that users removed from this channel will not be removed in
                Unified Help.
              </Description>
              <Input
                id="orgChannelId"
                value={orgChannelId}
                placeholder="C07TM4C0AQ5"
                onChange={(e) => {
                  setOrgChannelId(e.target.value);
                  setErrors((prev) => ({ ...prev, orgChannelId: undefined }));
                }}
                className="font-mono"
              />
              {errors.orgChannelId && (
                <FieldError>{errors.orgChannelId}</FieldError>
              )}
            </TextField>
          </div>
          <TextField
            type="text"
            variant="secondary"
            isInvalid={!!errors.createMessage}
          >
            <Label htmlFor="createMessage">Ticket creation message</Label>
            <Description>
              Unified Help will reply with this message whenever a new ticket is
              created. You may use markdown to write this message. Use{" "}
              {`{USERNAME}`} to mention the creator in this message.
            </Description>
            <TextArea
              id="createMessage"
              value={createMessage}
              onChange={(e) => {
                setCreateMessage(e.target.value);
                setErrors((prev) => ({ ...prev, createMessage: undefined }));
              }}
            />
            {errors.createMessage && (
              <FieldError>{errors.createMessage}</FieldError>
            )}
          </TextField>
          <TextField
            type="text"
            variant="secondary"
            isInvalid={!!errors.resolveMessage}
          >
            <Label htmlFor="resolveMessage">Ticket resolve message</Label>
            <Description>
              Unified Help will reply with this message whenever a ticket is
              resolved. You may use markdown to write this message. Use{" "}
              {`{USERNAME}`} to mention the resolver in this message.
            </Description>
            <TextArea
              id="resolveMessage"
              value={resolveMessage}
              onChange={(e) => {
                setResolveMessage(e.target.value);
                setErrors((prev) => ({ ...prev, resolveMessage: undefined }));
              }}
            />
            {errors.resolveMessage && (
              <FieldError>{errors.resolveMessage}</FieldError>
            )}
          </TextField>
          <Button onClick={handleAddProgram}>
            <PlusIcon /> Add program
          </Button>
        </Card>
      </div>
    </div>
  );
}
