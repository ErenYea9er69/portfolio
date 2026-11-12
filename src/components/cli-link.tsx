"use client";

import Link from "next/link";
import { guardCliAccess } from "@/lib/device";
import { ComponentProps } from "react";

export function CliLink({
  children,
  onClick,
  ...props
}: Omit<ComponentProps<typeof Link>, "href"> & { onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void }) {
  return (
    <Link
      {...props}
      href="/cli"
      onClick={(e) => {
        if (!guardCliAccess(e)) return;
        if (onClick) onClick(e);
      }}
    >
      {children}
    </Link>
  );
}

