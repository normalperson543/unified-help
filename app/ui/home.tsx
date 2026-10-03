"use client";
import { GlobalStats, ProgramWithCount } from "../lib/types";
import {
  Avatar,
  Button,
  ButtonGroup,
  Card,
  Chip,
  Input,
  TextArea,
  ToggleButton,
} from "@heroui/react";
import {
  CheckIcon,
  CircleDashedIcon,
  CircleIcon,
  ChevronDownIcon,
  FilterIcon,
  MousePointer2Icon,
  PencilLineIcon,
  ReplyIcon,
  RocketIcon,
  SearchIcon,
  SendIcon,
  SparklesIcon,
  TagIcon,
} from "lucide-react";
import Image from "next/image";
import SignInButton from "@/app/ui/sign-in-button";
import Marquee from "react-fast-marquee";
import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import Link from "next/link";
import { authClient } from "../lib/auth-client";
export default function HomeUI({
  stats,
  programs,
}: {
  stats: GlobalStats;
  programs: ProgramWithCount[];
}) {
  const { data: session } = authClient.useSession();

  return (
    <div className="flex flex-col gap-2 w-full flex-1 min-h-0 overflow-y-auto">
      <div className="grow bg-radial-[at_25%_25%] dark:from-[#133856] light:from-[#338eda] to-transparent to-75%">
        <div className="flex flex-col xl:flex-row w-full justify-between items-center gap-12 bg-radial-[at_75%_25%] dark:from-[#3e0e15] light:from-[#ec3750] to-transparent to-75% p-6 md:p-12">
          <div className="flex flex-col gap-12 w-full xl:w-1/2">
            <div className="flex flex-col gap-4">
              <Chip className="flex gap-2 items-center text-muted w-fit" variant="primary">
                <SparklesIcon width={12} />
                <p>
                  <b>New: </b> Deploy new help channels in <em>seconds</em>.
                  Unified Help is now a full support bot replacement.{" "}
                  <Link href="/dashboard/add-program" target="_blank" className="underline">
                    Get started.
                  </Link>
                </p>
              </Chip>
              <Image
                src="/assets/logo.svg"
                width={64}
                height={64}
                alt="Unified Help logo"
              />
              <p className="text-4xl">
                <b>Unified Help</b> manages, filters, and analyzes all your{" "}
                <span className="text-[#ec3750] font-bold">Hack Club</span>{" "}
                support tickets in <b>one place</b>
              </p>
              <div className="flex flex-col">
                <div className="flex gap-2 items-center">
                  <CheckIcon />
                  Search through tickets by keywords, tags, assignees, or status
                </div>
                <div className="flex gap-2 items-center">
                  <CheckIcon />
                  Deploy new help channels in seconds
                </div>
                <div className="flex gap-2 items-center">
                  <CheckIcon />
                  Search across all Unified Help programs
                </div>
                <div className="flex gap-2 items-center">
                  <CheckIcon />
                  In depth statistics like resolve time, hang times, and reply
                  trends per user and per program
                </div>
                <div className="flex gap-2 items-center">
                  <CheckIcon />
                  Reply and resolve tickets within Unified Help without breaking
                  context (on compatible programs)
                </div>
              </div>
              <div className="flex flex-row gap-2">
                <Card className="basis-50 grow shrink relative">
                  <div className="flex flex-col gap-1 items-center text-center">
                    <p className="text-4xl font-bold">
                      <AnimatedCounter end={stats.tickets} />
                    </p>
                    <p className="text-muted">tickets</p>
                  </div>
                </Card>
                <Card className="basis-50 grow shrink relative">
                  <div className="flex flex-col gap-1 items-center text-center">
                    <p className="text-4xl font-bold">
                      <AnimatedCounter end={stats.replies} />
                    </p>
                    <p className="text-muted">tracked replies</p>
                  </div>
                </Card>
                <Card className="basis-50 grow shrink relative">
                  <div className="flex flex-col gap-1 items-center text-center">
                    <p className="text-4xl font-bold">
                      <AnimatedCounter end={stats.slackUsers} />
                    </p>
                    <p className="text-muted">tracked users</p>
                  </div>
                </Card>
                <Card className="basis-50 grow shrink relative">
                  <div className="flex flex-col gap-1 items-center text-center">
                    <p className="text-4xl font-bold">
                      <AnimatedCounter end={stats.helpers} />
                    </p>
                    <p className="text-muted">helpers</p>
                  </div>
                </Card>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              {session ? (
                <Link href="/dashboard">
                  <Button>
                    <RocketIcon />
                    Launch
                  </Button>
                </Link>
              ) : (
                <SignInButton>
                  <RocketIcon />
                  Sign in
                </SignInButton>
              )}
              <Link href="/dashboard/add-program" target="_blank">
                <Button variant="secondary">
                  <PencilLineIcon />
                  Get Unified Help for your program
                </Button>
              </Link>
              <Link
                href="https://github.com/normalperson543/unified-help"
                target="_blank"
              >
                <Button variant="secondary">
                  <Image
                    src="/assets/github.svg"
                    width={16}
                    height={16}
                    alt="GitHub logo"
                  />
                  Contribute on GitHub
                </Button>
              </Link>
            </div>
            <div className="flex gap-1 items-center text-muted">
              Made with{" "}
              <Image
                src="/assets/yay.gif"
                width={16}
                height={16}
                alt="Yay emoji"
              />
              by{" "}
              <Link
                href="https://github.com/normalperson543"
                className="underline"
                target="_blank"
              >
                normalperson543
              </Link>
            </div>
          </div>
          <HeroProductPreview />
        </div>
        <div className="p-12 flex flex-col gap-6 items-center">
          <div className="flex flex-col gap-3 items-center text-center">
            <h2 className="text-xl font-bold">
              These programs are indexed on Unified Help
            </h2>
            <p className="text-muted">
              Unified Help is not affiliated or endorsed with any of these
              programs.
            </p>
          </div>
          <Marquee pauseOnHover>
            <div className="flex flex-row gap-4">
              {programs.map((p) => (
                <Card className="w-96" key={p.id}>
                  {p.logo && (
                    <Image
                      src={p.logo}
                      alt="Program logo"
                      width={32}
                      height={32}
                    />
                  )}
                  <b>{p.name}</b>
                  <p className="text-muted">
                    {p._count.tickets} tickets - {p._count.assignedUsers}{" "}
                    helpers
                  </p>
                </Card>
              ))}
            </div>
          </Marquee>
        </div>
      </div>
    </div>
  );
}

function HeroProductPreview() {
  const [phase, setPhase] = useState<
    "idle" | "posting" | "received" | "resolved" | "clearing"
  >("idle");

  useEffect(() => {
    const nextPhase = {
      idle: "posting",
      posting: "received",
      received: "resolved",
      resolved: "clearing",
      clearing: "idle",
    }[phase] as typeof phase;
    const delay =
      phase === "idle"
        ? 1800
        : phase === "posting"
          ? 1800
          : phase === "clearing"
            ? 700
            : 2600;
    const timer = window.setTimeout(() => setPhase(nextPhase), delay);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const isResolved = phase === "resolved" || phase === "clearing";
  const isAssigned = phase === "posting" || phase === "received" || isResolved;

  return (
    <div className="relative w-full max-w-3xl xl:w-1/2 xl:max-w-none py-8 sm:py-12">
      <Card className="relative overflow-visible p-0 shadow-2xl">
        <div className="flex min-h-130 w-full text-[10px] sm:text-xs">
          <div className="flex w-[38%] shrink-0 flex-col gap-2 border-r border-accent-background bg-background p-2 sm:p-3">
            <div className="flex items-center gap-1">
              <SearchIcon width={12} />
              <Input
                aria-label="Search by name"
                className="w-full"
                placeholder="Search by name"
              />
              <ToggleButton aria-label="Filters">
                <FilterIcon width={12} />
              </ToggleButton>
            </div>
            <div className="flex flex-col gap-1 border-b border-accent-background pb-2">
              <Input aria-label="Assignees" placeholder="Select assignees" />
              <Input aria-label="Tags" placeholder="Select tags" />
              <div className="flex gap-1">
                <Button className="min-w-0 flex-1" variant="secondary">
                  All statuses <ChevronDownIcon width={12} />
                </Button>
                <Button className="min-w-0 flex-1" variant="secondary">
                  Descending <ChevronDownIcon width={12} />
                </Button>
              </div>
            </div>
            <p className="text-muted px-1">Showing 1-4 of 24 results</p>
            <div className="flex flex-col gap-1">
              <HeroTicketRow title="How do I make a Hack Club?" user="normalperson543" status={isResolved ? "resolved" : isAssigned ? "assigned" : "open"} active/>
              <HeroTicketRow title="I need help with my grant" user="Devarsh" status="assigned" />
              <HeroTicketRow title="My project hasn't been reviewed" user="astra celestine" status="resolved" />
              <HeroTicketRow title="I hava question about shipping my project" user="swn" status="open" />
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-3 overflow-hidden">
            <motion.div
              className={`flex items-start justify-between gap-2 border-b border-accent-background p-3 text-white ${isResolved ? "bg-green-950" : isAssigned ? "bg-blue-950" : "bg-orange-950"}`}
              animate={{ backgroundColor: isResolved ? "#052e16" : isAssigned ? "#172554" : "#431407" }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex min-w-0 gap-2">
                <Avatar size="sm">
                  <Avatar.Fallback>D</Avatar.Fallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-bold">How do I make a Hack Club</p>
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={isResolved ? "resolved" : isAssigned ? "assigned" : "open"}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Chip color={isResolved ? "success" : isAssigned ? "accent" : "warning"} variant="primary">
                          {isResolved ? <CheckIcon width={10} /> : isAssigned ? <CircleIcon width={10} /> : <CircleDashedIcon width={10} />}
                          {isResolved ? "Resolved" : isAssigned ? "Assigned" : "Open"}
                        </Chip>
                      </motion.div>
                    </AnimatePresence>
                    <Chip>clubs</Chip>
                    <Chip>urgent</Chip>
                  </div>
                </div>
              </div>
              <Button className="shrink-0" size="sm" variant={isResolved ? "secondary" : "primary"}>
                Open in Slack
              </Button>
            </motion.div>

            <div className="flex flex-col gap-4 p-3 sm:p-5">
              <HeroPost username="Devarsh" label="OP" message="How do I make a Hack Club?" />
              <AnimatePresence initial={false} mode="popLayout">
                {(phase === "posting" || phase === "received" || phase === "resolved") && (
                  <motion.div
                    key="helper-reply"
                    initial={{ opacity: 0, y: 18, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -18, height: 0 }}
                    layout
                    transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  >
                    <HeroPost username="normalperson543" label="Helper" message="check out apply.hackclub.com!" helper />
                  </motion.div>
                )}
                {(phase === "received" || phase === "resolved") && (
                  <motion.div
                    key="op-reply"
                    initial={{ opacity: 0, y: 18, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -18, height: 0 }}
                    layout
                    transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  >
                    <HeroPost username="Devarsh" label="OP" message="Thanks, found it!" />
                  </motion.div>
                )}
                {phase === "resolved" && (
                  <motion.div
                    key="resolution-event"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96, height: 0 }}
                    layout
                    className="flex items-center gap-1 rounded-md border border-green-200 bg-green-50 p-2 text-green-950 dark:border-green-700 dark:bg-green-950 dark:text-green-50"
                  >
                    <CheckIcon width={14} /> Marked as <b>resolved</b> by normalperson543
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex gap-2">
                <Avatar size="sm"><Avatar.Fallback>n</Avatar.Fallback></Avatar>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <motion.div animate={{ opacity: isResolved ? 0.55 : 1 }} transition={{ duration: 0.4 }}>
                    <TextArea
                      aria-label="Reply"
                      className="h-18 w-full"
                      disabled={isResolved}
                      value={phase === "idle" ? "check out apply.hackclub.com!" : ""}
                      placeholder={isResolved ? "Ticket resolved" : "Reply to this ticket..."}
                      readOnly
                    />
                  </motion.div>
                  <div className="flex flex-wrap gap-1">
                    <Button size="sm" isPending={phase === "posting"} isDisabled={isResolved}>
                      {phase === "posting" ? "Posting..." : <><SendIcon width={14} /> Reply</>}
                    </Button>
                    <ButtonGroup>
                      <Button size="sm" variant="secondary" isPending={phase === "resolved"} isDisabled={!isAssigned || isResolved}>
                        <CheckIcon width={14} /> Resolve
                      </Button>
                      <Button isIconOnly size="sm" variant="secondary" aria-label="Resolve with macro" isDisabled={isResolved}>
                        <ChevronDownIcon width={14} />
                      </Button>
                    </ButtonGroup>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="absolute -left-3 top-2 flex w-fit -rotate-3 flex-row items-center gap-2 p-2 shadow-xl sm:-left-8">
        <ReplyIcon className="text-blue-500" width={16} />
        <span className="font-bold">Reply without losing context</span>
      </Card>
      <Card className="absolute -right-3 bottom-2 flex w-fit rotate-3 flex-row items-center gap-2 p-2 shadow-xl sm:-right-8">
        <SearchIcon className="text-[#ec3750]" width={16} />
        <span className="font-bold">Search and filter tickets quickly</span>
      </Card>
    </div>
  );
}

function HeroTicketRow({
  title,
  user,
  status,
  active = false,
}: {
  title: string;
  user: string;
  status: "open" | "assigned" | "resolved";
  active?: boolean;
}) {
  const statusStyles = {
    open: "border-orange-700",
    assigned: "border-blue-700",
    resolved: "border-green-700",
  };

  return (
    <div className={`flex items-center gap-2 border-l-2 p-2 ${statusStyles[status]} ${active ? "bg-accent-soft" : ""}`}>
      <Avatar size="sm"><Avatar.Fallback>{user[0].toUpperCase()}</Avatar.Fallback></Avatar>
      <div className="min-w-0">
        <p className="truncate font-medium">{title}</p>
        <p className="truncate text-muted">{user} - Opened today - 2 replies</p>
      </div>
    </div>
  );
}

function HeroPost({
  username,
  label,
  message,
  helper = false,
}: {
  username: string;
  label: "OP" | "Helper";
  message: string;
  helper?: boolean;
}) {
  return (
    <div className="flex min-w-0 gap-2">
      <Avatar size="sm"><Avatar.Fallback>{username[0].toUpperCase()}</Avatar.Fallback></Avatar>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-1">
          <span className="font-bold">{username}</span>
          <Chip color={helper ? "success" : "accent"} variant="primary">{label}</Chip>
          <span className="ml-auto shrink-0 text-muted">Just now</span>
        </div>
        <p>{message}</p>
      </div>
    </div>
  );
}

function AnimatedCounter({ end }: { end: number }) {
  // this part is claude code but i didn't spend too much time on it
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
  });
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    motionValue.set(end);
  }, [end, motionValue]);
  return <motion.span>{display}</motion.span>;
}
