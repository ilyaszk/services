"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function ConversationLink() {
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

      // Rafraîchir toutes les 60 secondes
      const interval = setInterval(fetchUnreadMessages, 60000);
      return () => clearInterval(interval);
    }
  }, [session, status]);

  if (status !== "authenticated") return null;

  return (
    <Link
      href="/conversations"
      className="relative text-gray-800 dark:text-gray-300 hover:text-[#0ea5e9] dark:hover:text-white border-transparent hover:border-[#0ea5e9] inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
    >
      Messages
      {!loading && unreadCount > 0 && (
        <Badge className="ml-1 bg-[#0ea5e9] hover:bg-[#0ea5e9] text-white absolute -top-1 -right-1 min-w-[1.25rem] h-5 flex items-center justify-center text-xs">
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      )}
    </Link>
  );
}
