"use client";
import { Spinner } from "@heroui/react";
import { randomLoadingText } from "../lib/loading-text";

export default function Loading() {
  return (
    <div className="flex justify-center items-center w-full h-full">
      <div className="flex flex-col items-center justify-center text-center gap-2">
        <Spinner />
        <p className="text-muted text-xs">{randomLoadingText()}</p>
      </div>
    </div>
  );
}
