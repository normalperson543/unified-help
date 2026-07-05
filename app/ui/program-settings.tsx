"use client";

import { Program } from "@/generated/prisma/client";
import {
  Button,
  DateField,
  DateValue,
  Input,
  Label,
  Modal,
  Spinner,
  toast,
  WarningIcon,
} from "@heroui/react";
import {
  CheckIcon,
  InfoIcon,
  PlayIcon,
  SaveIcon,
  SquareIcon,
  SquareStopIcon,
} from "lucide-react";
import { useState } from "react";
import { BacklogStatus } from "../lib/types";
import { startBacklog, stopBacklog } from "../lib/actions";
import { getLocalTimeZone } from "@internationalized/date";

function StartButton({ programId }: { programId: string }) {
  const [startDate, setStartDate] = useState<DateValue | null>(null);
  const [endDate, setEndDate] = useState<DateValue | null>(null);
  async function handleBacklog() {
    startBacklog(
      programId,
      String(startDate?.toDate(getLocalTimeZone()).getTime()),
      String(endDate?.toDate(getLocalTimeZone()).getTime()),
    );
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
export default function ProgramSettings({
  program,
  backlogStatus,
}: {
  program: Program;
  backlogStatus: BacklogStatus;
}) {
  const [programName, setProgramName] = useState(program.name);

  async function handleStopBacklog() {
    stopBacklog(program.id)
  }
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
      <Button>
        <SaveIcon /> Save changes
      </Button>
    </div>
  );
}
