"use client";

import Link from "next/link";
import { useState } from "react";

export default function NotificationsPermission() {
  const [enabled, setEnabled] = useState(false);

  if (window === undefined) return
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") return;

  if (enabled) return;
  
  function requestPerms() {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        setEnabled(true);
        new Notification("You've enabled notifications!");
      }
    });
  }

  return (
    <div className="w-full bg-yellow-500 text-black p-2 text-center">
      <p>
        <b>Enable notifications</b> to get notified when new tickets arrive.{" "}
        <Link href="#" onClick={requestPerms} className="underline">
          Enable now
        </Link>
      </p>
    </div>
  );
}
