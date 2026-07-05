"use client";

import { Program } from "@/generated/prisma/client";
import { Button, DateField, Input, Label, Modal, Spinner } from "@heroui/react";
import { InfoIcon, PlayIcon, SaveIcon, SquareStopIcon } from "lucide-react";
import { useState } from "react";
import { BacklogStatus } from "../lib/types";

export default function ProgramSettings({
  program,
  backlogStatus,
}: {
  program: Program;
  backlogStatus: BacklogStatus;
}) {
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
                          <DateField name="startDate">
                            <Label>Start date</Label>
                            <p className="text-muted">
                              All tickets after this date will be indexed.
                            </p>
                            <DateField.Group variant="secondary">
                              <DateField.Input>
                                {(segment) => (
                                  <DateField.Segment segment={segment} />
                                )}
                              </DateField.Input>
                            </DateField.Group>
                          </DateField>
                          <DateField name="endDate">
                            <Label>End date</Label>
                            <p className="text-muted">
                              All tickets before this date will be indexed.
                            </p>
                            <DateField.Group variant="secondary">
                              <DateField.Input>
                                {(segment) => (
                                  <DateField.Segment segment={segment} />
                                )}
                              </DateField.Input>
                            </DateField.Group>
                          </DateField>
                        </div>
                      </Modal.Body>
                      <Modal.Footer>
                        <Button slot="close">
                          <PlayIcon />
                          Confirm and start
                        </Button>
                      </Modal.Footer>
                    </Modal.Dialog>
                  </Modal.Container>
                </Modal.Backdrop>
              </Modal>
            </>
          )}
          {backlogStatus.status === "pending" && (
            <>
              <Spinner size="sm" />
              Backlog job started on{" "}
              {backlogStatus.job?.startDate.toLocaleString()}
              <Button>
                <SquareStopIcon /> Stop
              </Button>
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
