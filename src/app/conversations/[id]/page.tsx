"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
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
      const socketUrl = `${process.env.NEXT_PUBLIC_SOCKET_URL || ""}`;
      console.log("Connecting to socket at:", socketUrl);
      const newSocket = io(socketUrl, {
        path: "/api/socket",
        query: {
          userId: session.user.id,
          conversationId: params.id as string,
        },
        autoConnect: false,
      });

      setSocket(newSocket);
      // Ajouter des événements de débogage
      newSocket.on("connect", () => {
        console.log("Socket connected:", newSocket.id);
      });

      newSocket.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
      });

      newSocket.connect();

      // Émettre un événement pour signaler que l'utilisateur est actif dans cette conversation
      newSocket.emit("join_conversation", {
        userId: session.user.id,
        username: session.user.name || "Utilisateur",
        conversationId: params.id,
      });

      return () => {
        // Signaler que l'utilisateur quitte la conversation
        newSocket.emit("leave_conversation", {
          userId: session.user.id,
          conversationId: params.id,
        });
        newSocket.disconnect();
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
      <div className="min-h-screen bg-white dark:bg-black flex justify-center items-center pt-24">
        <Loader2 className="h-12 w-12 animate-spin text-[#0ea5e9]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-black pt-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20">
            <CardHeader>
              <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
                Erreur
              </h2>
            </CardHeader>
            <CardContent>
              <p className="text-red-600 dark:text-red-300">{error}</p>
            </CardContent>
            <CardFooter>
              <Link href="/conversations" className="w-full">
                <Button className="w-full bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] hover:opacity-90 transition-opacity">
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
      <div className="min-h-screen bg-white dark:bg-black pt-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-[#0ea5e9]/30 bg-[#0ea5e9]/5 dark:bg-[#0ea5e9]/10">
            <CardHeader>
              <h2 className="text-xl font-bold text-[#0ea5e9]">
                Conversation non trouvée
              </h2>
            </CardHeader>
            <CardContent>
              <p className="text-[#0ea5e9]">
                Cette conversation n'existe pas ou vous n'y avez pas accès.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/conversations" className="w-full">
                <Button className="w-full bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] hover:opacity-90 transition-opacity">
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
    <div className="min-h-screen bg-white dark:bg-black flex flex-col pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[30%] -left-[10%] w-[40%] h-[70%] rounded-full bg-[#1e40af]/5 dark:bg-[#1e40af]/10 blur-[120px]"></div>
        <div className="absolute top-[50%] -right-[10%] w-[40%] h-[60%] rounded-full bg-[#10b981]/5 dark:bg-[#10b981]/10 blur-[120px]"></div>
      </div>
      {/* Header */}
      <header className="sticky top-16 z-10 bg-white/90 dark:bg-black/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="container mx-auto max-w-4xl px-4 py-3">
          <div className="flex items-center">
            <Link
              href="/conversations"
              className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </Link>

            <div className="flex-1">
              <div className="flex items-center">
                {otherParticipant ? (
                  <>
                    {otherParticipant.image ? (
                      <Image
                        src={otherParticipant.image}
                        alt={otherParticipant.name || "Utilisateur"}
                        width={40}
                        height={40}
                        className="rounded-full mr-3"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#1e40af] flex items-center justify-center text-white mr-3">
                        {otherParticipant.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                    <div>
                      <h2 className="font-medium text-gray-900 dark:text-white">
                        {otherParticipant.name || "Utilisateur"}
                      </h2>
                      {conversation.offer && (
                        <p className="text-xs text-[#0ea5e9]">
                          {conversation.offer.title}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <h2 className="font-medium text-gray-900 dark:text-white">
                    {conversation.title || "Conversation"}
                  </h2>
                )}
              </div>
            </div>

            {conversation.offer && (
              <Link href={`/offres/${conversation.offer.id}`}>
                <Button variant="outline" size="sm">
                  Voir l'offre
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>
      {/* Messages */}
      <div className="flex-1 overflow-hidden relative z-10">
        <div className="container mx-auto max-w-4xl px-4 py-6 overflow-y-auto h-[calc(100vh-180px)]">
          {conversation.messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                Aucun message dans cette conversation.
                <br />
                Envoyez le premier message !
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {" "}
              {conversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === session?.user?.id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  {/* Afficher l'avatar pour les messages des autres */}
                  {message.senderId !== session?.user?.id && (
                    <div className="mr-2">
                      {message.sender.image ? (
                        <Image
                          src={message.sender.image}
                          alt={message.sender.name || "Utilisateur"}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#1e40af] flex items-center justify-center text-white text-xs">
                          {message.sender.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.senderId === session?.user?.id
                        ? "bg-[#0ea5e9] text-white rounded-br-none"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none"
                    }`}
                  >
                    {/* Nom de l'expéditeur si ce n'est pas l'utilisateur actuel */}
                    {message.senderId !== session?.user?.id && (
                      <div className="text-xs font-semibold mb-1 text-[#8b5cf6] dark:text-[#a78bfa]">
                        {message.sender.name || "Utilisateur"}
                      </div>
                    )}
                    <div className="text-sm">{message.content}</div>
                    <div
                      className={`text-xs mt-1 ${
                        message.senderId === session?.user?.id
                          ? "text-blue-100"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>{" "}
      {/* Message Input */}
      <div className="relative z-10 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto max-w-4xl px-4 py-3">
          {userTyping && (
            <div className="px-2 py-1 mb-2 text-xs text-[#8b5cf6] dark:text-[#a78bfa] font-medium animate-pulse">
              {userTyping.username} est en train d'écrire...
            </div>
          )}
          <form onSubmit={handleSendMessage} className="flex items-center">
            <input
              type="text"
              value={newMessage}
              onChange={handleTyping}
              placeholder="Votre message..."
              className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] dark:focus:ring-[#0ea5e9]"
            />
            <Button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white rounded-l-none rounded-r-lg"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
      {/* Typing Indicator */}
      {otherUserTyping && (
        <div className="absolute left-0 right-0 bottom-16 z-10">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#1e40af] flex items-center justify-center text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="animate-pulse h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 3a1 1 0 011 1v2a1 1 0 11-2 0V4a1 1 0 011-1zm0 10a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zm7-5a1 1 0 00-1-1h-2a1 1 0 000 2h2a1 1 0 001-1zm-10 0a1 1 0 00-1-1H4a1 1 0 000 2h2a1 1 0 001-1zm10 7a1 1 0 00-1-1h-2a1 1 0 000 2h2a1 1 0 001-1zm-10 0a1 1 0 00-1-1H4a1 1 0 000 2h2a1 1 0 001-1z" />
                </svg>
              </div>
              <div className="flex-1 text-gray-500 dark:text-gray-400 text-sm">
                L'autre utilisateur est en train d'écrire...
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
