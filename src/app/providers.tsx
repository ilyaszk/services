"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { RoleProvider } from "@/components/role-toggle";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={true}>
        <RoleProvider>
          {children}
        </RoleProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
