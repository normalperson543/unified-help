"use client";
import { GlobalStats, ProgramWithCount } from "../lib/types";
import { Button, Card } from "@heroui/react";
import { PencilLineIcon, RocketIcon } from "lucide-react";
import Image from "next/image";
import SignInButton from "@/app/ui/sign-in-button";
import Marquee from "react-fast-marquee";
import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
export default function HomeUI({
  stats,
  programs,
}: {
  stats: GlobalStats;
  programs: ProgramWithCount[];
}) {
  return (
    <div className="flex flex-col gap-2  w-full h-full">
      <div className="bg-radial-[at_25%_25%] dark:from-[#133856] light:from-[#338eda] to-transparent to-75%">
        <div className="flex flex-row w-full justify-between items-center bg-radial-[at_75%_25%] dark:from-[#3e0e15] light:from-[#ec3750] to-transparent to-75% p-12">
          <div className="flex flex-col gap-12">
            <div className="flex flex-col gap-6">
              <p className="text-4xl">
                <b>Unified Help</b> manages, filters, and analyzes all your{" "}
                <span className="text-[#ec3750] font-bold">Hack Club</span>{" "}
                support tickets in <b>one place</b>
              </p>
              <p>We handle the help, so you focus on your program.</p>
              <div className="flex flex-row gap-2">
                <Card className="basis-50 grow shrink relative">
                  <div className="flex flex-col gap-1 items-center text-center">
                    <p className="text-4xl font-bold italic"><AnimatedCounter end={stats.tickets} /></p>
                    <p className="text-muted">tickets</p>
                  </div>
                </Card>
                <Card className="basis-50 grow shrink relative">
                  <div className="flex flex-col gap-1 items-center text-center">
                    <p className="text-4xl font-bold italic">{stats.replies}</p>
                    <p className="text-muted">tracked replies</p>
                  </div>
                </Card>
                <Card className="basis-50 grow shrink relative">
                  <div className="flex flex-col gap-1 items-center text-center">
                    <p className="text-4xl font-bold italic">
                      {stats.slackUsers}
                    </p>
                    <p className="text-muted">tracked users</p>
                  </div>
                </Card>
                <Card className="basis-50 grow shrink relative">
                  <div className="flex flex-col gap-1 items-center text-center">
                    <p className="text-4xl font-bold italic">{stats.helpers}</p>
                    <p className="text-muted">helpers</p>
                  </div>
                </Card>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <SignInButton>
                <RocketIcon />
                Get started
              </SignInButton>
              <Button variant="secondary">
                <PencilLineIcon />
                Use Unified Help for your program
              </Button>
            </div>
          </div>
          <Image
            src="/assets/hero-image.png"
            width={1000}
            height={1000}
            className="w-1/2"
            alt="Hero image"
          />
        </div>
        <div className="p-12 flex flex-col gap-6 items-center">
          <h2 className="text-xl font-bold">
            These programs already use Unified Help
          </h2>
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
  }, [end]);
  return <motion.span>{display}</motion.span>;
}
