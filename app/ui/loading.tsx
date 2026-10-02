"use client";
import { Spinner } from "@heroui/react";
import { useEffect, useState } from "react";
import { LOADING_TEXT } from "../lib/loading-text";

export default function Loading() {
  const [text, setText] = useState(LOADING_TEXT[0]);

  useEffect(() => {
    setText(LOADING_TEXT[Math.floor(Math.random() * LOADING_TEXT.length)]);
  }, []);

  return (
    <div className="flex justify-center items-center w-full h-full">
      <div className="flex flex-col items-center justify-center text-center gap-2" suppressHydrationWarning>
        <Spinner />
        <p className="text-muted text-xs">{text}</p>
      </div>
    </div>
  );
}
