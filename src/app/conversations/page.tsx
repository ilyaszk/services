"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, MessageSquarePlus, Search, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Conversation {
  id: string;
  title: string | null;
  lastMessage?: {
    content: string;
    createdAt: string;
    senderId: string;
  } | null;
  updatedAt: string;
  unreadCount: number;
  offer: {
    id: string;
    title: string;
  } | null;
  participants: {
    user: {
      id: string;
      name: string | null;
      image: string | null;
    };
  }[];
}

export default function ConversationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<
    Conversation[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  // Rediriger vers la page de connexion si non connecté
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/conversations");
    }
  }, [status, router]);

  // Récupérer les conversations de l'utilisateur
  useEffect(() => {
    async function fetchConversations() {
      if (status !== "authenticated") return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/conversations");

        if (!response.ok) {
          throw new Error("Problème lors de la récupération des conversations");
        }
        const data = await response.json();
        setConversations(data);
        setFilteredConversations(data); // Initialiser les conversations filtrées
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue"
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user) {
      fetchConversations();
    }
  }, [session, status]);

  // Effet pour filtrer les conversations en fonction de la recherche et du filtre
  useEffect(() => {
    if (!conversations.length) {
      setFilteredConversations([]);
      return;
    }

    let results = [...conversations];

    // Filtre par statut de lecture
    if (filter === "unread") {
      results = results.filter((conv) => conv.unreadCount > 0);
    } else if (filter === "read") {
      results = results.filter((conv) => conv.unreadCount === 0);
    }

    // Filtre par recherche textuelle
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      results = results.filter((conv) => {
        // Rechercher dans le titre
        if (conv.title?.toLowerCase().includes(query)) return true;

        // Rechercher dans le nom des participants
        const participantMatch = conv.participants.some((p) =>
          p.user.name?.toLowerCase().includes(query)
        );
        if (participantMatch) return true;

        // Rechercher dans le titre de l'offre
        if (conv.offer?.title.toLowerCase().includes(query)) return true;

        // Rechercher dans le dernier message
        return conv.lastMessage?.content.toLowerCase().includes(query);
      });
    }

    // Trier par date, plus récentes en premier
    results.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    setFilteredConversations(results);
  }, [conversations, searchQuery, filter]);

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
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-24 px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[30%] -left-[10%] w-[40%] h-[70%] rounded-full bg-[#1e40af]/5 dark:bg-[#1e40af]/10 blur-[120px]"></div>
        <div className="absolute top-[50%] -right-[10%] w-[40%] h-[60%] rounded-full bg-[#10b981]/5 dark:bg-[#10b981]/10 blur-[120px]"></div>
      </div>{" "}
      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="flex justify-between items-center mb-8 px-1">
          {" "}
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6]">
              Mes conversations
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {conversations.length === 0
                ? "Aucune conversation active"
                : filteredConversations.length === conversations.length
                ? `${conversations.length} conversation${
                    conversations.length > 1 ? "s" : ""
                  }`
                : `${filteredConversations.length} sur ${
                    conversations.length
                  } conversation${conversations.length > 1 ? "s" : ""}`}
            </p>
          </div>
          <Link href="/offres">
            <Button
              variant="outline"
              className="border-[#0ea5e9] text-[#0ea5e9] hover:bg-[#0ea5e9]/10"
            >
              Parcourir les offres
            </Button>
          </Link>{" "}
        </div>

        {/* Barre de recherche et filtres */}
        {conversations.length > 0 && (
          <div className="mb-6">
            <div className="relative flex items-center mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Rechercher une conversation..."
                className="pl-10 pr-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 rounded-lg focus:border-[#0ea5e9] dark:focus:border-[#0ea5e9] focus:ring-[#0ea5e9] dark:focus:ring-[#0ea5e9]"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge
                onClick={() => setFilter("all")}
                className={`cursor-pointer px-3 py-1 ${
                  filter === "all"
                    ? "bg-[#0ea5e9] hover:bg-[#0ea5e9]/90"
                    : "bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                }`}
              >
                Toutes
              </Badge>
              <Badge
                onClick={() => setFilter("unread")}
                className={`cursor-pointer px-3 py-1 ${
                  filter === "unread"
                    ? "bg-[#0ea5e9] hover:bg-[#0ea5e9]/90"
                    : "bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                }`}
              >
                Non lues
                {conversations.filter((c) => c.unreadCount > 0).length > 0 && (
                  <span className="ml-1 bg-white text-[#0ea5e9] text-xs rounded-full px-1.5 py-0.5">
                    {conversations.filter((c) => c.unreadCount > 0).length}
                  </span>
                )}
              </Badge>
              <Badge
                onClick={() => setFilter("read")}
                className={`cursor-pointer px-3 py-1 ${
                  filter === "read"
                    ? "bg-[#0ea5e9] hover:bg-[#0ea5e9]/90"
                    : "bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                }`}
              >
                Lues
              </Badge>
            </div>
          </div>
        )}

        {conversations.length === 0 ? (
          <Card className="border border-gray-200 dark:border-gray-800 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black">
            <CardContent className="py-12">
              <div className="text-center">
                <MessageSquarePlus className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Aucune conversation
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Vous n'avez pas encore de conversation. Contacter un
                  prestataire à partir d'une offre pour démarrer une discussion.
                </p>
                <Link href="/offres">
                  <Button className="bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] hover:opacity-90 transition-opacity">
                    Voir les offres
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : filteredConversations.length === 0 ? (
          <Card className="border border-gray-200 dark:border-gray-800 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black">
            <CardContent className="py-12">
              <div className="text-center">
                <Search className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Aucun résultat
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Aucune conversation ne correspond à votre recherche.
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setFilter("all");
                  }}
                  className="bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] hover:opacity-90 transition-opacity"
                >
                  Réinitialiser la recherche
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredConversations.map((conversation) => {
              // Trouver l'autre participant
              const otherParticipant = conversation.participants.find(
                (p) => p.user.id !== session?.user?.id
              )?.user;

              return (
                <Link
                  href={`/conversations/${conversation.id}`}
                  key={conversation.id}
                  className="block transform transition-all hover:scale-[1.01] animate-fadeIn"
                  style={{
                    animationDelay: `${
                      filteredConversations.indexOf(conversation) * 50
                    }ms`,
                  }}
                >
                  <Card
                    className={`border ${
                      conversation.unreadCount > 0
                        ? "border-[#0ea5e9] dark:border-[#0ea5e9] shadow-md"
                        : "border-gray-200 dark:border-gray-800"
                    } bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black hover:border-[#0ea5e9]/70 dark:hover:border-[#0ea5e9]/50 transition-all hover:shadow-md cursor-pointer`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        {/* Avatar de l'autre participant */}
                        {otherParticipant && (
                          <div className="mr-3 flex-shrink-0">
                            {otherParticipant.image ? (
                              <img
                                src={otherParticipant.image}
                                alt={otherParticipant.name || "Utilisateur"}
                                className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-sm"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#0ea5e9] flex items-center justify-center text-white text-lg font-semibold shadow-sm">
                                {otherParticipant.name
                                  ?.charAt(0)
                                  .toUpperCase() || "?"}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex-grow min-w-0">
                          <div className="flex items-center justify-between">
                            <h3
                              className={`font-medium truncate ${
                                conversation.unreadCount > 0
                                  ? "text-[#0ea5e9] font-semibold"
                                  : "text-gray-900 dark:text-white"
                              }`}
                            >
                              {otherParticipant?.name ||
                                conversation.title ||
                                "Conversation sans titre"}
                            </h3>
                            <div className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                              {new Date(
                                conversation.updatedAt
                              ).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "short",
                              })}
                            </div>
                          </div>

                          {conversation.offer && (
                            <div className="mt-1 text-xs font-medium text-[#0ea5e9] truncate">
                              Offre: {conversation.offer.title}
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-1">
                            <p
                              className={`text-sm truncate ${
                                conversation.unreadCount > 0
                                  ? "text-gray-800 dark:text-gray-200"
                                  : "text-gray-500 dark:text-gray-400"
                              }`}
                            >
                              {conversation.lastMessage
                                ? conversation.lastMessage.content
                                : "Aucun message"}
                            </p>

                            {conversation.unreadCount > 0 && (
                              <div className="ml-2 flex-shrink-0 bg-[#0ea5e9] text-white text-xs font-bold rounded-full px-2 py-1 min-w-[1.5rem] text-center">
                                {conversation.unreadCount}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
