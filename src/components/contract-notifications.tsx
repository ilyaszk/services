"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Bell, Check, X } from "lucide-react";
import Link from "next/link";
import { useNotificationSound } from "@/hooks/useNotificationSound";
import { useSocket } from "@/hooks/useSocket";

interface ContractNotification {
  contractId: string;
  contractTitle: string;
  clientName: string;
  clientEmail: string;
  pendingStepsCount: number;
  totalValue: number;
  createdAt: string;
  steps: any[];
}

interface NotificationsData {
  count: number;
  notifications: ContractNotification[];
}

export default function ContractNotifications() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<NotificationsData | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const { playNotificationSound } = useNotificationSound();
  const previousCountRef = useRef<number>(0);
  const socket = useSocket();

  const fetchNotifications = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      const response = await fetch('/api/contracts/notifications');
      if (response.ok) {
        const data = await response.json();

        // Jouer un son si le nombre de notifications a augmenté
        if (notifications && data.count > previousCountRef.current && data.count > 0) {
          playNotificationSound();
        }

        previousCountRef.current = data.count;
        setNotifications(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [session?.user?.id]);

  // Gérer les notifications en temps réel via Socket.io
  useEffect(() => {
    if (!socket || !session?.user?.id) return;

    const handleNewContractNotification = (newNotification: ContractNotification) => {
      console.log("Nouvelle notification reçue:", newNotification);

      setNotifications(prev => {
        if (!prev) {
          return {
            count: 1,
            notifications: [newNotification]
          };
        }

        // Vérifier si cette notification existe déjà
        const exists = prev.notifications.some(n => n.contractId === newNotification.contractId);
        if (exists) {
          return prev;
        }

        // Jouer le son de notification
        playNotificationSound();

        return {
          count: prev.count + 1,
          notifications: [newNotification, ...prev.notifications]
        };
      });
    };

    socket.on("new_contract_notification", handleNewContractNotification);

    return () => {
      socket.off("new_contract_notification", handleNewContractNotification);
    };
  }, [socket, session?.user?.id, playNotificationSound]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!session?.user?.id || !notifications) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <Bell className="w-5 h-5" />
        {notifications.count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {notifications.count > 9 ? '9+' : notifications.count}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Nouveaux contrats ({notifications.count})
            </h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Aucune nouvelle demande</p>
              </div>
            ) : (
              notifications.notifications.map((notification) => (
                <div key={notification.contractId} className="p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Link
                    href={`/contrats/${notification.contractId}`}
                    onClick={() => setShowDropdown(false)}
                    className="block"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">
                        {notification.contractTitle}
                      </h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 whitespace-nowrap">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span className="font-medium">Client:</span> {notification.clientName}
                    </p>

                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                      <span>{notification.pendingStepsCount} étape(s) en attente</span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {formatPrice(notification.totalValue)}
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                      Cliquer pour voir les détails →
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>

          {notifications.notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/contrats"
                onClick={() => setShowDropdown(false)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Voir tous les contrats →
              </Link>
            </div>
          )}
        </div>
      )}

      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}
