"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

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
              <Link href="/offres" className="w-full">
                <Button className="w-full bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] hover:opacity-90 transition-opacity">
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
      <div className="min-h-screen bg-white dark:bg-black pt-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-[#0ea5e9]/30 bg-[#0ea5e9]/5 dark:bg-[#0ea5e9]/10">
            <CardHeader>
              <h2 className="text-xl font-bold text-[#0ea5e9]">
                Offre non trouvée
              </h2>
            </CardHeader>
            <CardContent>
              <p className="text-[#0ea5e9]">
                Cette offre n'existe pas ou a été supprimée.
              </p>
            </CardContent>
            <CardFooter>
              <Link href="/offres" className="w-full">
                <Button className="w-full bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] hover:opacity-90 transition-opacity">
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
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[30%] -left-[10%] w-[40%] h-[70%] rounded-full bg-[#1e40af]/5 dark:bg-[#1e40af]/10 blur-[120px]"></div>
        <div className="absolute top-[50%] -right-[10%] w-[40%] h-[60%] rounded-full bg-[#10b981]/5 dark:bg-[#10b981]/10 blur-[120px]"></div>
      </div>

      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="mb-6">
          <Link
            href={`/offres/${offer.id}`}
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-[#0ea5e9] dark:hover:text-[#0ea5e9] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'offre
          </Link>
        </div>

        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 mb-8">
          Contacter le prestataire
        </h1>

        <Card className="border border-gray-200 dark:border-gray-800 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black overflow-hidden">
          <CardHeader className="border-b border-gray-200 dark:border-gray-800">
            <div className="mb-2">
              <span className="text-sm font-medium text-[#0ea5e9]">
                À propos de l'offre:
              </span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {offer.title}
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {offer.price} €
            </div>
          </CardHeader>

          <CardContent className="py-6">
            <form onSubmit={handleStartConversation}>
              <div className="mb-6">
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Votre message
                </label>
                <textarea
                  id="message"
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Décrivez votre demande ou posez vos questions concernant cette offre..."
                  className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={!message.trim() || sending}
                className="w-full bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] hover:opacity-90 transition-opacity"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Envoyer le message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
