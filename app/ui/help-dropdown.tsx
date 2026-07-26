"use client";

import { Button, Dropdown, Label } from "@heroui/react";
import { HelpCircleIcon, PencilLineIcon } from "lucide-react";
import { FaGithub, FaSlack } from "react-icons/fa";

export default function HelpDropdown() {
  return (
    <Dropdown>
      <Dropdown.Trigger>
        <Button variant="tertiary">
          <HelpCircleIcon width={16} />
        </Button>
      </Dropdown.Trigger>
      <Dropdown.Popover>
        <Dropdown.Menu>
          <Dropdown.Item href="https://hackclub.enterprise.slack.com/archives/C0BF67GV9KL" target="_blank">
            <FaSlack width={16} />
            <Label>
              <p>Get help</p>
              <p className="text-muted">
                Open #unified-help on Slack
              </p>
            </Label>
          </Dropdown.Item>
          <Dropdown.Item href="https://github.com/normalperson543/unified-help" target="_blank">
            <FaGithub width={16} />
            <Label>
              <p>GitHub repository</p>
              <p className="text-muted">
                Contribute to this pwease
              </p>
            </Label>
          </Dropdown.Item>
          <Dropdown.Item href="https://forms.fillout.com/t/k1NNiLbTasus" target="_blank">
            <PencilLineIcon width={16} />
            <Label>
              <p>Apply for Unified Help</p>
              <p className="text-muted">
                Get Unified Help for your program!
              </p>
            </Label>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
