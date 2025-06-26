"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { SocketProvider } from "@/components/SocketProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={true}>
        <SocketProvider>
          {children}
        </SocketProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
