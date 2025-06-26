"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Loader2,
  Send,
  MessageSquare,
  Phone,
  Video,
  Clock,
  Check,
  CheckCheck,
  Info,
  UserCircle,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { io, Socket } from "socket.io-client";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  receiverId: string | null;
  isRead: boolean;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface Conversation {
  id: string;
  title: string | null;
  createdAt: string;
  offer: {
    id: string;
    title: string;
    price: number;
  } | null;
  messages: Message[];
  participants: {
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    };
  }[];
}

export default function ConversationDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [otherUserTyping, setOtherUserTyping] = useState<boolean>(false);

  // Rediriger vers la page de connexion si non connecté
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/auth/signin?callbackUrl=/conversations/${params?.id}`);
    }
  }, [status, router, params?.id]);
  // Demander les permissions de notification
  useEffect(() => {
    if (
      "Notification" in window &&
      Notification.permission !== "granted" &&
      Notification.permission !== "denied"
    ) {
      Notification.requestPermission();
    }
  }, []); // Initialiser le socket
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id && params?.id) {
      // Fonction pour initialiser le socket
      const initializeSocket = async () => {
        try {
          // D'abord, faire un appel pour s'assurer que le serveur Socket.IO est initialisé
          await fetch("/api/socket", { method: "GET" });

          // Maintenant créer la connexion socket
          const newSocket = io({
            path: "/api/socket",
            query: {
              userId: session.user.id,
              conversationId: params.id as string,
            },
            transports: ["polling", "websocket"], // Commencer par polling puis upgrade vers websocket
            upgrade: true,
            rememberUpgrade: true,
            timeout: 20000,
            forceNew: true,
          });

          setSocket(newSocket);

          // Ajouter des événements de débogage
          newSocket.on("connect", () => {
            console.log("Socket connected:", newSocket.id);
          });

          newSocket.on("connect_error", (err) => {
            console.error("Socket connection error:", err.message);
            console.error("Socket connection error details:", err);
          });

          newSocket.on("disconnect", (reason) => {
            console.log("Socket disconnected:", reason);
          });

          // Émettre un événement pour signaler que l'utilisateur est actif dans cette conversation
          newSocket.on("connect", () => {
            newSocket.emit("join_conversation", {
              userId: session.user.id,
              username: session.user.name || "Utilisateur",
              conversationId: params.id,
            });
          });

          return newSocket;
        } catch (error) {
          console.error("Erreur lors de l'initialisation du socket:", error);
          return null;
        }
      };

      initializeSocket();

      return () => {
        // Signaler que l'utilisateur quitte la conversation
        if (socket) {
          socket.emit("leave_conversation", {
            userId: session.user.id,
            conversationId: params.id,
          });
          socket.disconnect();
        }
      };
    }
  }, [session, status, params?.id]); // État pour gérer les notifications
  const [hasNewMessage, setHasNewMessage] = useState<boolean>(false);
  const [unreadMessages, setUnreadMessages] = useState<number>(0);
  const [windowFocused, setWindowFocused] = useState<boolean>(true);
  const [userTyping, setUserTyping] = useState<{
    userId: string;
    username: string;
  } | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] =
    useState<boolean>(false);

  // Détecter si la fenêtre est active ou non
  useEffect(() => {
    const handleFocus = () => setWindowFocused(true);
    const handleBlur = () => setWindowFocused(false);

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    // Vérifier si les notifications sont activées
    if ("Notification" in window) {
      setNotificationsEnabled(Notification.permission === "granted");
    }

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);
  // Écouter les nouveaux messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      if (message.senderId !== session?.user?.id) {
        setConversation((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: [...prev.messages, message],
          };
        });

        // Si la fenêtre n'est pas active, montrer une notification
        if (!windowFocused) {
          setHasNewMessage(true);
          setUnreadMessages((prev) => prev + 1);

          // Essayer d'afficher une notification native si autorisé
          if (notificationsEnabled) {
            try {
              const sender = message.sender.name || "Utilisateur";
              const notification = new Notification(
                `Nouveau message de ${sender}`,
                {
                  body:
                    message.content.substring(0, 50) +
                    (message.content.length > 50 ? "..." : ""),
                  icon: message.sender.image || "/favicon.ico",
                  badge: "/favicon.ico",
                  tag: `conversation-${params?.id || "unknown"}`,
                }
              );

              // Ajouter un gestionnaire de clic sur la notification pour ouvrir la conversation
              notification.onclick = () => {
                window.focus();
                notification.close();
              };
            } catch (error) {
              console.error("Erreur lors de l'envoi de la notification", error);
            }
          }

          // Changer le titre de la page pour indiquer un nouveau message
          document.title = `(${unreadMessages + 1}) Nouveau message - SMP`;

          // Ajouter un son pour la notification (optionnel)
          try {
            const audio = new Audio("/notification-sound.mp3");
            audio.volume = 0.5;
            audio
              .play()
              .catch((err) => console.error("Erreur de lecture audio:", err));
          } catch (error) {
            console.error("Erreur lors de la lecture du son", error);
          }
        }

        // Réinitialiser l'état "en train d'écrire" après réception du message
        setUserTyping(null);
      }
    };

    socket.on("new_message", handleNewMessage);

    // Écouter quand les utilisateurs rejoignent/quittent la conversation
    const handleUserJoined = (data: { userId: string; username: string }) => {
      console.log(`${data.username} a rejoint la conversation`);
      // Vous pouvez afficher une notification ou mettre à jour l'interface ici
    };

    const handleUserLeft = (data: { userId: string; username: string }) => {
      console.log(`${data.username} a quitté la conversation`);
      // Vous pouvez afficher une notification ou mettre à jour l'interface ici
    };

    socket.on("user_joined", handleUserJoined);
    socket.on("user_left", handleUserLeft);
    socket.on("user_disconnected", (data) => {
      if (data.userId !== session?.user?.id) {
        setUserTyping(null);
      }
    });

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("user_joined", handleUserJoined);
      socket.off("user_left", handleUserLeft);
      socket.off("user_disconnected");
    };
  }, [
    socket,
    session?.user?.id,
    windowFocused,
    unreadMessages,
    notificationsEnabled,
    params?.id,
  ]);

  // Réinitialiser les notifications quand la fenêtre est active
  useEffect(() => {
    if (windowFocused && hasNewMessage) {
      setHasNewMessage(false);
      setUnreadMessages(0);
      document.title = "Conversation - SMP";
    }
  }, [windowFocused, hasNewMessage]);
  // Récupérer les détails de la conversation
  useEffect(() => {
    async function fetchConversation() {
      if (status !== "authenticated" || !params?.id) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/conversations/${params.id}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(
              "Cette conversation n'existe pas ou vous n'y avez pas accès"
            );
          }
          throw new Error(
            "Problème lors de la récupération de la conversation"
          );
        }

        const data = await response.json();
        setConversation(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user && params?.id) {
      fetchConversation();
    }
  }, [session, status, params?.id]);

  // Scroll vers le bas quand on reçoit de nouveaux messages
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation?.messages]);
  // Fonction pour envoyer un message
  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();

    if (!newMessage.trim() || sending || !session?.user?.id || !params?.id)
      return;

    setSending(true);

    try {
      const response = await fetch(`/api/conversations/${params.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newMessage,
        }),
      });

      if (!response.ok) {
        throw new Error("Problème lors de l'envoi du message");
      }

      const newMsg = await response.json();

      // Mettre à jour la conversation avec le nouveau message
      setConversation((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...prev.messages, newMsg],
        };
      });
      // Émettre un événement de nouveau message via socket.io
      if (socket) {
        socket.emit("send_message", newMsg);
      }

      setNewMessage("");

      // Réinitialiser l'état de frappe
      if (isTyping && socket && session?.user && params?.id) {
        setIsTyping(false);
        socket.emit("typing", {
          userId: session.user.id,
          username: session.user.name || "Utilisateur",
          conversationId: params?.id,
          isTyping: false,
        });

        if (typingTimeout) clearTimeout(typingTimeout);
      }
    } catch (err) {
      console.error("Erreur d'envoi:", err);
      alert("Impossible d'envoyer le message. Veuillez réessayer.");
    } finally {
      setSending(false);
    }
  }

  // Obtenir l'autre participant (pas l'utilisateur actuel)
  const otherParticipant = conversation?.participants.find(
    (p) => p.user.id !== session?.user?.id
  )?.user;
  // Fonction pour gérer l'état de frappe
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    // Émettre un événement indiquant que l'utilisateur est en train d'écrire
    if (socket && session?.user?.id && params?.id) {
      if (!isTyping) {
        setIsTyping(true);
        socket.emit("typing", {
          userId: session.user.id,
          username: session.user.name || "Utilisateur",
          conversationId: params.id,
          isTyping: true,
        });
      }

      // Réinitialiser le timeout
      if (typingTimeout) clearTimeout(typingTimeout);

      // Après 2 secondes d'inactivité, indiquer que l'utilisateur a arrêté de taper
      const timeout = setTimeout(() => {
        setIsTyping(false);
        socket.emit("typing", {
          userId: session.user.id,
          username: session.user.name || "Utilisateur",
          conversationId: params.id,
          isTyping: false,
        });
      }, 2000);

      setTypingTimeout(timeout);
    }
  };

  // Écouter les événements de frappe de l'autre utilisateur
  useEffect(() => {
    if (!socket) return;

    const handleTypingEvent = (data: {
      userId: string;
      username: string;
      isTyping: boolean;
    }) => {
      if (data.userId !== session?.user?.id) {
        if (data.isTyping) {
          setUserTyping({ userId: data.userId, username: data.username });
        } else {
          setUserTyping(null);
        }
      }
    };

    socket.on("user_typing", handleTypingEvent);

    return () => {
      socket.off("user_typing", handleTypingEvent);
    };
  }, [socket, session?.user?.id]);
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex flex-col justify-center items-center">
        <div className="relative">
          <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800/50 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#0ea5e9]" />
          </div>
          <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-[#8b5cf6] rounded-full flex items-center justify-center">
            <MessageSquare className="h-3 w-3 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-xl font-medium text-gray-800 dark:text-gray-200">
          Chargement de la conversation...
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Veuillez patienter un instant
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex flex-col justify-center items-center px-4">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <svg
                className="h-8 w-8 text-red-500 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          <Card className="border-red-200 dark:border-red-900/50 bg-white dark:bg-gray-900">
            <CardHeader>
              <h2 className="text-xl font-bold text-center text-red-600 dark:text-red-400">
                Erreur lors du chargement
              </h2>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 text-center">
                {error}
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Link href="/conversations">
                <Button className="bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] hover:opacity-90 transition-opacity px-6">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour aux conversations
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex flex-col justify-center items-center px-4">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <MessageSquare className="h-8 w-8 text-[#0ea5e9]" />
            </div>
          </div>

          <Card className="border-[#0ea5e9]/20 dark:border-[#0ea5e9]/20 bg-white dark:bg-gray-900">
            <CardHeader>
              <h2 className="text-xl font-bold text-center text-[#0ea5e9]">
                Conversation non trouvée
              </h2>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 text-center">
                Cette conversation n'existe pas ou vous n'y avez pas accès.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Link href="/conversations">
                <Button className="bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] hover:opacity-90 transition-opacity px-6">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour aux conversations
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col ">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute -top-[20%] -left-[5%] w-[35%] h-[50%] rounded-full bg-[#0ea5e9]/5 dark:bg-[#0ea5e9]/10 blur-[80px]"></div>
        <div className="absolute top-[30%] -right-[15%] w-[45%] h-[40%] rounded-full bg-[#8b5cf6]/5 dark:bg-[#8b5cf6]/10 blur-[100px]"></div>
        <div className="absolute bottom-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-[#10b981]/5 dark:bg-[#10b981]/10 blur-[90px]"></div>
        <div className="hidden md:block absolute top-[15%] left-[40%] w-[15%] h-[20%] rounded-full bg-[#f59e0b]/5 dark:bg-[#f59e0b]/10 blur-[70px]"></div>
      </div>
      {/* Header */}
      <header className=" bg-white/90 dark:bg-black/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="container mx-auto max-w-4xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/conversations"
                className="shrink-0 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center"
                aria-label="Retour aux conversations"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </Link>

              {otherParticipant ? (
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-white dark:border-gray-800">
                    <AvatarImage
                      src={otherParticipant.image || ""}
                      alt={otherParticipant.name || "Utilisateur"}
                    />
                    <AvatarFallback className="bg-gradient-to-r from-[#8b5cf6] to-[#1e40af] text-white">
                      {otherParticipant.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <h2 className="font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
                      {otherParticipant.name || "Utilisateur"}
                      <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    </h2>
                    {conversation.offer && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Info className="h-3 w-3" />
                        <p className="truncate max-w-[180px]">
                          {conversation.offer.title}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#1e40af] flex items-center justify-center text-white">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <h2 className="font-medium text-gray-900 dark:text-white">
                    {conversation.title || "Conversation"}
                  </h2>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {conversation.offer && (
                <Link href={`/offres/${conversation.offer.id}`}>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <ChevronRight className="h-3 w-3" />
                    Voir l'offre
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>{" "}
      {/* Messages */}
      <div className="flex-1 overflow-hidden relative z-10">
        <div className="container mx-auto max-w-4xl px-4 py-6 overflow-y-auto h-[calc(100vh-180px)]">
          {conversation.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="h-10 w-10 text-[#0ea5e9] opacity-70" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                Début de la conversation
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                C'est le début de votre conversation avec{" "}
                {otherParticipant?.name || "cette personne"}.
                <br />
                Envoyez un message pour commencer à discuter !
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center mb-6">
                <Badge
                  variant="outline"
                  className="bg-white/50 dark:bg-black/50 text-gray-500 dark:text-gray-400 font-normal"
                >
                  <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                  Conversation démarrée le{" "}
                  {new Date(conversation.createdAt).toLocaleDateString(
                    "fr-FR",
                    { day: "numeric", month: "long", year: "numeric" }
                  )}
                </Badge>
              </div>

              {conversation.messages.map((message, index) => {
                const isConsecutive =
                  index > 0 &&
                  conversation.messages[index - 1].senderId ===
                    message.senderId;
                const isSender = message.senderId === session?.user?.id;

                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      isSender ? "justify-end" : "justify-start"
                    } ${isConsecutive ? "mt-1" : "mt-4"}`}
                  >
                    {/* Avatar pour les messages des autres */}
                    {!isSender && !isConsecutive && (
                      <div className="mr-2 flex-shrink-0">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={message.sender.image || ""}
                            alt={message.sender.name || "Utilisateur"}
                          />
                          <AvatarFallback className="text-xs bg-gradient-to-r from-[#8b5cf6] to-[#1e40af] text-white">
                            {message.sender.name?.charAt(0).toUpperCase() ||
                              "U"}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    )}

                    {/* Espace pour aligner les messages consécutifs */}
                    {!isSender && isConsecutive && (
                      <div className="w-10 mr-2 flex-shrink-0"></div>
                    )}

                    <div
                      className={`group relative max-w-[75%] rounded-2xl px-4 py-3 ${
                        isSender
                          ? "bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] text-white rounded-br-none"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none"
                      } ${isConsecutive ? "rounded-t-lg" : ""}`}
                    >
                      {/* Nom de l'expéditeur si ce n'est pas l'utilisateur actuel et pas un message consécutif */}
                      {!isSender && !isConsecutive && (
                        <div className="text-xs font-medium mb-1 text-[#8b5cf6] dark:text-[#a78bfa]">
                          {message.sender.name || "Utilisateur"}
                        </div>
                      )}

                      <div className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </div>

                      <div
                        className={`flex items-center gap-1 text-xs mt-1 ${
                          isSender
                            ? "text-blue-100/80"
                            : "text-gray-500 dark:text-gray-400"
                        } opacity-70 group-hover:opacity-100 transition-opacity`}
                      >
                        {new Date(message.createdAt).toLocaleTimeString(
                          "fr-FR",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                        {isSender && (
                          <span className="ml-1">
                            {message.isRead ? (
                              <CheckCheck className="h-3 w-3" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>
      {/* Typing Indicator */}
      {userTyping && (
        <div className="container mx-auto max-w-4xl px-4">
          <div className="flex items-center pl-10 mb-2">
            <div className="flex gap-1 items-center">
              <div className="animate-bounce w-2 h-2 bg-[#8b5cf6] rounded-full delay-0"></div>
              <div className="animate-bounce w-2 h-2 bg-[#8b5cf6] rounded-full delay-75"></div>
              <div className="animate-bounce w-2 h-2 bg-[#8b5cf6] rounded-full delay-150"></div>
            </div>
            <div className="ml-2 text-xs text-[#8b5cf6] font-medium">
              {userTyping.username} est en train d'écrire...
            </div>
          </div>
        </div>
      )}
      {/* Message Input */}
      <div className="sticky bottom-0 z-10 bg-white/95 dark:bg-black/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto max-w-4xl px-4 py-3">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={newMessage}
                onChange={handleTyping}
                placeholder="Votre message..."
                className="w-full bg-gray-100 dark:bg-gray-800/80 text-gray-900 dark:text-white rounded-full px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] dark:focus:ring-[#0ea5e9]/70 transition-shadow"
              />
            </div>
            <Button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] hover:opacity-90 transition-opacity text-white rounded-full w-10 h-10 flex items-center justify-center shrink-0"
              aria-label="Envoyer le message"
            >
              {sending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
