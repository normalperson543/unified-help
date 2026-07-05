"use client";

import { Program } from "@/generated/prisma/client";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Chip,
  DateField,
  DateValue,
  Description,
  Input,
  Label,
  Modal,
  Spinner,
  Switch,
  TextField,
  toast,
  WarningIcon,
} from "@heroui/react";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  InfoIcon,
  PlayIcon,
  PlusIcon,
  SaveIcon,
  ShieldIcon,
  SquareIcon,
  SquareStopIcon,
  TriangleAlertIcon,
  UserIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { BacklogStatus, ProgramWithAssignees } from "../lib/types";
import {
  addAsHelper,
  removeHelper,
  saveUserGroup,
  setAutoIndex,
  startBacklog,
  stopBacklog,
  updateInfo,
} from "../lib/actions";
import { getLocalTimeZone } from "@internationalized/date";
import { createUser } from "../lib/slack";

export default function ProgramSettings({
  program,
  backlogStatus,
}: {
  program: ProgramWithAssignees;
  backlogStatus: BacklogStatus;
}) {
  const [programName, setProgramName] = useState(program.name);
  const [channelId, setChannelId] = useState(program.channelId);
  const [autoIndex, setAutoIndex] = useState(program.canAutoIndex);
  const [userGroup, setUserGroup] = useState(program.userGroup ?? "");
  const [slackId, setSlackId] = useState("");

  async function handleStopBacklog() {
    stopBacklog(program.id);
  }
  async function handleAddUserAsHelper() {
    let user;
    try {
      user = await createUser(slackId);
    } catch {
      toast("There was a problem finding this Slack user", {
        description: "Make sure the Slack user ID is correct.",
        indicator: <TriangleAlertIcon />,
        variant: "danger",
      });
      return;
    }
    try {
      await addAsHelper(slackId, program.id);
    } catch {
      toast("There was a problem linking the Slack user to the program", {
        indicator: <TriangleAlertIcon />,
        variant: "danger",
      });
      return;
    }
    toast(`Added ${user?.username} as a helper`, {
      indicator: <CheckIcon />,
      variant: "success",
    });
  }

  async function handleSaveGroupId() {
    await saveUserGroup(userGroup, program.id);
    toast("Saved and indexing users", {
      description:
        "Unified Help will start indexing users from this user group.",
      indicator: <CheckIcon />,
      variant: "success",
    });
  }

  async function handleRemoveHelper(id: string) {
    await removeHelper(id, program.id);
    toast("Removed helper", {
      indicator: <CheckIcon />,
      variant: "success",
    });
  }

  async function handleUpdateInfo() {
    await updateInfo(program.id, programName, autoIndex)
    toast("Updated info", {
      indicator: <CheckIcon />,
      variant: "success",
    });
  }
  return (
    <div className="flex flex-col gap-4 p-4 w-full h-full">
      <h2 className="text-lg font-bold">Settings for {program?.name}</h2>
      <div className="flex flex-col gap-2">
        <TextField type="text">
          <Label htmlFor="programName">Program name</Label>
          <Input
            value={programName}
            onChange={(e) => setProgramName(e.target.value)}
          />
        </TextField>
        <TextField type="text">
          <Label htmlFor="programName">Channel ID</Label>
          <Description>
            Unified Help will use this channel ID to index tickets and for
            ticket links. Be careful when changing this.
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
        <Button onClick={handleUpdateInfo}>
          <SaveIcon /> Save changes
        </Button>
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="programName">Backlog</Label>
        <p className="text-muted">
          You can choose to index previous tickets from your support channel so
          that they&apos;ll appear on Unified Help.
        </p>
        <div className="flex flex-row gap-2 items-center">
          {backlogStatus.status === "unqueued" && (
            <>
              <InfoIcon width={16} />
              No active backlog tasks
              <StartButton programId={program.id} />
            </>
          )}
          {backlogStatus.status === "pending" && (
            <>
              <Spinner size="sm" />
              Backlog job started
              <Button onClick={handleStopBacklog}>
                <SquareIcon /> Stop
              </Button>
            </>
          )}
          {backlogStatus.status === "success" && (
            <>
              <CheckIcon width={16} />
              Backlog job completed
              <StartButton programId={program.id} />
            </>
          )}
          {backlogStatus.status === "failed" && (
            <>
              <WarningIcon width={16} />
              Backlog job failed
              <StartButton programId={program.id} />
            </>
          )}
          {backlogStatus.status === "stopped" && (
            <>
              <SquareIcon width={16} />
              Backlog job stopped
              <StartButton programId={program.id} />
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex gap-1 items-center">
          <div className="flex flex-col gap-1 flex-1">
            <Label htmlFor="programName">Helpers</Label>
            <p className="text-muted">
              Manage Slack users who handle tickets in this program.
            </p>
          </div>
          <Modal>
            <Button>
              <PlusIcon />
              Add helper
            </Button>
            <Modal.Backdrop>
              <Modal.Container>
                <Modal.Dialog>
                  <Modal.CloseTrigger />
                  <Modal.Header>
                    <Modal.Heading>Add helper to {program.name}</Modal.Heading>
                  </Modal.Header>
                  <Modal.Body>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="programName">
                        Enter the Slack ID of the user you want to add
                      </Label>
                      <p className="text-muted">
                        Get this by going to #what-is-my-slack-id or go to the
                        Slack profile, clicking on the 3 dots, and clicking
                        &quot;Copy member ID&quot;
                      </p>
                      <Input
                        type="text"
                        id="programName"
                        variant="secondary"
                        value={slackId}
                        onChange={(e) => setSlackId(e.target.value)}
                        className="font-mono"
                      />
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button slot="close" onClick={handleAddUserAsHelper}>
                      <PlusIcon />
                      Add
                    </Button>
                  </Modal.Footer>
                </Modal.Dialog>
              </Modal.Container>
            </Modal.Backdrop>
          </Modal>
        </div>
        <div className="flex gap-2 flex-wrap">
          {program.assignedUsers.map((u) => (
            <Card key={u.id} className="basis-50 grow shrink">
              <div className="flex flex-col gap-2 items-center justify-center">
                <Avatar size="sm">
                  <Avatar.Image
                    src={`https://cachet.dunkirk.sh/users/${u.id}/r`}
                    alt="Profile picture"
                  />
                  <Avatar.Fallback>
                    {u.username.substring(0, 1)}
                  </Avatar.Fallback>
                </Avatar>
                <p className="font-bold text-lg">{u.username}</p>
                <p className="text-muted font-mono">{u.id}</p>
                {u.users.length > 0 &&
                  u.users[0].programsOrganizing.filter(
                    (p) => p.id === program.id,
                  ).length === 0 && (
                    <>
                      <Chip>
                        <UserIcon width={12} />
                        Registered helper
                      </Chip>
                      <Button>
                        <ChevronUpIcon /> Make org
                      </Button>
                    </>
                  )}
                {u.users.length > 0 &&
                  u.users[0].programsOrganizing.filter(
                    (p) => p.id === program.id,
                  ).length > 0 && (
                    <>
                      <Chip>
                        <ShieldIcon width={12} />
                        Organizer
                      </Chip>
                      <Modal>
                        <Button variant="danger">
                          <ChevronDownIcon /> Demote
                        </Button>
                        <Modal.Backdrop>
                          <Modal.Container>
                            <Modal.Dialog>
                              <Modal.CloseTrigger />
                              <Modal.Header>
                                <Modal.Heading>
                                  Demote {u.username} from {program.name}?
                                </Modal.Heading>
                              </Modal.Header>
                              <Modal.Body>
                                <div className="flex flex-row gap-2 items-center">
                                  <Badge.Anchor>
                                    <Avatar size="sm">
                                      <Avatar.Image
                                        src={`https://cachet.dunkirk.sh/users/${u.id}/r`}
                                        alt="Profile picture"
                                      />
                                      <Avatar.Fallback>
                                        {u.username.substring(0, 1)}
                                      </Avatar.Fallback>
                                    </Avatar>
                                    <Badge
                                      color="danger"
                                      placement="bottom-right"
                                      size="sm"
                                    >
                                      <ChevronDownIcon className="size-2.5" />
                                    </Badge>
                                  </Badge.Anchor>
                                  <p>
                                    Confirm you would like to demote{" "}
                                    <b>{u.username}</b> to a helper role in{" "}
                                    <b>{program.name}</b>?
                                  </p>
                                </div>
                              </Modal.Body>
                              <Modal.Footer>
                                <Button slot="close" variant="danger">
                                  <ChevronDownIcon />
                                  Demote
                                </Button>
                              </Modal.Footer>
                            </Modal.Dialog>
                          </Modal.Container>
                        </Modal.Backdrop>
                      </Modal>
                    </>
                  )}
                {u.users.length === 0 && (
                  <>
                    <Chip>
                      <WarningIcon width={12} />
                      Unregistered on Unified Help
                    </Chip>
                    <Button isDisabled={true}>
                      <ChevronUpIcon /> Awaiting signup
                    </Button>
                  </>
                )}
                <Modal>
                  <Button variant="danger">
                    <XIcon /> Remove
                  </Button>
                  <Modal.Backdrop>
                    <Modal.Container>
                      <Modal.Dialog>
                        <Modal.CloseTrigger />
                        <Modal.Header>
                          <Modal.Heading>
                            Remove {u.username} from {program.name}?
                          </Modal.Heading>
                        </Modal.Header>
                        <Modal.Body>
                          <div className="flex flex-row gap-2 items-center">
                            <Badge.Anchor>
                              <Avatar size="sm">
                                <Avatar.Image
                                  src={`https://cachet.dunkirk.sh/users/${u.id}/r`}
                                  alt="Profile picture"
                                />
                                <Avatar.Fallback>
                                  {u.username.substring(0, 1)}
                                </Avatar.Fallback>
                              </Avatar>
                              <Badge
                                color="danger"
                                placement="bottom-right"
                                size="sm"
                              >
                                <XIcon className="size-2.5" />
                              </Badge>
                            </Badge.Anchor>
                            <p>
                              Confirm you would like to remove{" "}
                              <b>{u.username}</b> from helping in{" "}
                              <b>{program.name}</b>?
                            </p>
                          </div>
                        </Modal.Body>
                        <Modal.Footer>
                          <Button
                            slot="close"
                            variant="danger"
                            onClick={() => handleRemoveHelper(u.id)}
                          >
                            <XIcon />
                            Remove
                          </Button>
                        </Modal.Footer>
                      </Modal.Dialog>
                    </Modal.Container>
                  </Modal.Backdrop>
                </Modal>
              </div>
            </Card>
          ))}
        </div>

        <TextField type="text">
          <Label htmlFor="programName">Linked user group</Label>
          <Description>
            Anyone in this user group will automatically be added as a helper.
            Note that users removed from this ping group will not be removed in
            Unified Help.
          </Description>
          <Description>
            Enter the group ID of the user group you want to link. You can find
            this by opening the user group on Slack, clicking the three dots,
            and clicking &quot;Copy group ID&quot;. Group IDs begin with S.
          </Description>
          <Input
            id="userGroup"
            value={userGroup}
            onChange={(e) => setUserGroup(e.target.value)}
            className="font-mono"
          />
          <Button onClick={handleSaveGroupId}>
            <SaveIcon /> Save changes
          </Button>
        </TextField>
      </div>
    </div>
  );
}

function StartButton({ programId }: { programId: string }) {
  const [startDate, setStartDate] = useState<DateValue | null>(null);
  const [endDate, setEndDate] = useState<DateValue | null>(null);
  async function handleBacklog() {
    startBacklog(
      programId,
      String(startDate?.toDate(getLocalTimeZone()).getTime()),
      String(endDate?.toDate(getLocalTimeZone()).getTime()),
    );
    toast("Backlog job started", {
      indicator: <CheckIcon />,
      variant: "success",
    });
  }
  return (
    <Modal>
      <Button>
        <PlayIcon /> Start
      </Button>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Start backlog task</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="flex flex-col gap-2">
                <DateField
                  name="startDate"
                  value={startDate}
                  onChange={setStartDate}
                >
                  <Label>Start date</Label>
                  <p className="text-muted">
                    All tickets after this date will be indexed.
                  </p>
                  <DateField.Group variant="secondary">
                    <DateField.Input>
                      {(segment) => <DateField.Segment segment={segment} />}
                    </DateField.Input>
                  </DateField.Group>
                </DateField>
                <DateField name="endDate" value={endDate} onChange={setEndDate}>
                  <Label>End date</Label>
                  <p className="text-muted">
                    All tickets before this date will be indexed.
                  </p>
                  <DateField.Group variant="secondary">
                    <DateField.Input>
                      {(segment) => <DateField.Segment segment={segment} />}
                    </DateField.Input>
                  </DateField.Group>
                </DateField>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button slot="close" onClick={handleBacklog}>
                <PlayIcon />
                Confirm and start
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
