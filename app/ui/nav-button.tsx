"use client";

import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export default function NavButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const router = useRouter();
  return (
    <Button variant="tertiary" onPress={() => router.push(href)}>
      {children}
    </Button>
  );
}
