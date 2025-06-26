"use client";

import { useSocketContext } from "@/components/SocketProvider";

export function useSocket() {
  const { socket } = useSocketContext();
  return socket;
}
