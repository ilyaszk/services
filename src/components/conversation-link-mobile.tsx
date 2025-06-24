"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function ConversationLinkMobile({ onClose }: { onClose?: () => void }) {
  const { data: session, status } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Récupérer le nombre de messages non lus
  useEffect(() => {
    async function fetchUnreadMessages() {
      if (status !== "authenticated") return;

      try {
        const response = await fetch("/api/conversations");
        if (!response.ok) throw new Error("Failed to fetch conversations");

        const data = await response.json();
        const count = data.reduce(
          (total: number, conv: any) => total + (conv.unreadCount || 0),
          0
        );
        setUnreadCount(count);
      } catch (error) {
        console.error("Error fetching unread messages:", error);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user) {
      fetchUnreadMessages();
    }
  }, [session, status]);

  if (status !== "authenticated") return null;

  return (
    <Link
      href="/conversations"
      className="flex pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-[#0ea5e9] items-center justify-between"
      onClick={onClose}
    >
      <span>Messages</span>
      {!loading && unreadCount > 0 && (
        <Badge className="bg-[#0ea5e9] hover:bg-[#0ea5e9] text-white ml-2">
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      )}
    </Link>
  );
}
