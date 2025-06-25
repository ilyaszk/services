"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Send,
  MessageCircle,
  Calendar,
  DollarSign,
  User,
  Clock,
  BadgeCheck,
  Info,
  FileText,
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

interface Offer {
  id: string;
  title: string;
  price: number;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
}

export default function NewConversationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);

  // Rediriger vers la page de connexion si non connecté
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(
        `/auth/signin?callbackUrl=/conversations/new/${params?.offerId}`
      );
    }
  }, [status, router, params?.offerId]);

  // Récupérer les détails de l'offre
  useEffect(() => {
    async function fetchOffer() {
      if (status !== "authenticated") return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/offers/${params?.offerId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Cette offre n'existe pas");
          }
          throw new Error("Problème lors de la récupération de l'offre");
        }

        const data = await response.json();

        // Vérifier si l'utilisateur est l'auteur de l'offre
        if (data.author?.id === session?.user?.id) {
          throw new Error(
            "Vous ne pouvez pas démarrer une conversation avec votre propre offre"
          );
        }

        setOffer(data);
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
      fetchOffer();
    }
  }, [session, status, params?.offerId]);

  // Fonction pour démarrer une nouvelle conversation
  async function handleStartConversation(e: React.FormEvent) {
    e.preventDefault();

    if (!message.trim() || sending || !session?.user?.id || !offer) return;

    setSending(true);

    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          offerId: offer.id,
          receiverId: offer.author?.id,
          firstMessage: message,
        }),
      });

      if (!response.ok) {
        throw new Error("Problème lors de la création de la conversation");
      }

      const newConversation = await response.json();
      router.push(`/conversations/${newConversation.id}`);
    } catch (err) {
      console.error("Erreur:", err);
      alert("Impossible de créer la conversation. Veuillez réessayer.");
      setSending(false);
    }
  }
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex flex-col justify-center items-center">
        <div className="relative">
          <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800/50 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#0ea5e9]" />
          </div>
          <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-[#8b5cf6] rounded-full flex items-center justify-center">
            <MessageCircle className="h-3 w-3 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-xl font-medium text-gray-800 dark:text-gray-200">
          Chargement de l'offre...
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
                Erreur
              </h2>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 text-center">
                {error}
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Link href="/offres">
                <Button className="bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] hover:opacity-90 transition-opacity px-6">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour aux offres
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex flex-col justify-center items-center px-4">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <FileText className="h-8 w-8 text-[#0ea5e9]" />
            </div>
          </div>

          <Card className="border-[#0ea5e9]/20 dark:border-[#0ea5e9]/20 bg-white dark:bg-gray-900">
            <CardHeader>
              <h2 className="text-xl font-bold text-center text-[#0ea5e9]">
                Offre non trouvée
              </h2>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 text-center">
                Cette offre n'existe pas ou a été supprimée.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Link href="/offres">
                <Button className="bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] hover:opacity-90 transition-opacity px-6">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour aux offres
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-white dark:bg-black pt-24 px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute -top-[20%] -left-[5%] w-[35%] h-[50%] rounded-full bg-[#0ea5e9]/5 dark:bg-[#0ea5e9]/10 blur-[80px]"></div>
        <div className="absolute top-[30%] -right-[15%] w-[45%] h-[40%] rounded-full bg-[#8b5cf6]/5 dark:bg-[#8b5cf6]/10 blur-[100px]"></div>
        <div className="absolute bottom-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-[#10b981]/5 dark:bg-[#10b981]/10 blur-[90px]"></div>
      </div>

      <div className="container mx-auto max-w-2xl relative z-10">
        <div className="mb-6">
          <Link
            href={`/offres/${offer.id}`}
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-[#0ea5e9] dark:hover:text-[#0ea5e9] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'offre
          </Link>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] mb-6">
          Démarrer une conversation
        </h1>

        <div className="mb-8">
          <Card className="overflow-hidden border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                <Badge className="w-fit bg-[#0ea5e9] hover:bg-[#0ea5e9] flex items-center gap-1">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Offre vérifiée
                </Badge>

                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>
                    Publiée le {new Date().toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-3 mb-1">
                {offer.title}
              </h2>

              <div className="flex items-center gap-3 mt-2">
                <Badge
                  variant="outline"
                  className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 flex items-center gap-1.5"
                >
                  <DollarSign className="h-3.5 w-3.5" />
                  {offer.price} €
                </Badge>

                <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 text-sm">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>{offer.author?.name || "Prestataire"}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="border-t border-gray-200 dark:border-gray-800 mt-2 pt-6">
                <form onSubmit={handleStartConversation}>
                  <div className="mb-6">
                    <label
                      htmlFor="message"
                      className="flex items-center gap-2 text-base font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      <MessageCircle className="h-5 w-5 text-[#0ea5e9]" />
                      Votre premier message
                    </label>

                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 mb-3 flex items-start gap-1">
                      <Info className="h-4 w-4 mt-0.5 shrink-0" />
                      <p>
                        Soyez précis dans votre demande pour obtenir une réponse
                        plus rapide et adaptée.
                      </p>
                    </div>

                    <textarea
                      id="message"
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Bonjour, je suis intéressé(e) par votre offre. Pouvez-vous me donner plus de détails sur..."
                      className="w-full bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/60 transition-shadow"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={!message.trim() || sending}
                    className="w-full bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] hover:opacity-90 transition-opacity py-6"
                  >
                    {sending ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <Send className="h-5 w-5 mr-2" />
                    )}
                    {sending ? "Envoi en cours..." : "Démarrer la conversation"}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
