"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

// This part was written by Claude because it had to 
// bugfix something about "window is not defined".
type Permission = NotificationPermission | "unsupported";

const listeners = new Set<() => void>();

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

function getSnapshot(): Permission {
  return "Notification" in window ? Notification.permission : "unsupported";
}

function getServerSnapshot(): Permission {
  return "unsupported";
}

export default function NotificationsPermission() {
  const permission = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  if (permission !== "default") return null; // End of Claude Code

  function requestPerms() {
    Notification.requestPermission().then((result) => {
      listeners.forEach((listener) => listener());
      if (result === "granted") {
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
