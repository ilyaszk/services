import NextAuth from "next-auth";
import type { NextRequest } from "next/server";
import { authConfig } from "@/lib/auth";

// Create the NextAuth handler
const handler = NextAuth(authConfig);

// Wrap the NextAuth handler in proper route handler functions
export async function GET(request: NextRequest) {
  return handler.handlers.GET(request);
}

export async function POST(request: NextRequest) {
  return handler.handlers.POST(request);
}
