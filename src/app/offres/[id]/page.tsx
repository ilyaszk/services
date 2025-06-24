"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, ArrowLeft, Mail, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  description: string;
  price: number;
  category: string;
  createdAt: string;
  author?: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
}

export default function OfferDetailPage() {
  const params = useParams();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour récupérer l'offre spécifique
  async function fetchOffer() {
    setLoading(true);
    setError(null);

    // Ensure params.id exists before making the request
    const offerId = params?.id;
    if (!offerId) {
      setError("ID de l'offre manquant");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/offers/${offerId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Cette offre n'existe pas ou a été supprimée");
        }
        throw new Error("Problème lors de la récupération de l'offre");
      }

      const data: Offer = await response.json();
      setOffer(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement de l'offre"
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Charger l'offre au chargement de la page
  useEffect(() => {
    if (params?.id) {
      fetchOffer();
    }
  }, [params]); // Use params object as dependency

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex justify-center items-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#0ea5e9]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex justify-center items-center">
        <Card className="border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20 max-w-md">
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
    );
  }
  if (!offer) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex justify-center items-center">
        <Card className="border-[#0ea5e9]/30 bg-[#0ea5e9]/5 dark:bg-[#0ea5e9]/10 max-w-md">
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
    );
  }
  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[30%] -left-[10%] w-[40%] h-[70%] rounded-full bg-[#1e40af]/5 dark:bg-[#1e40af]/10 blur-[120px]"></div>
        <div className="absolute top-[50%] -right-[10%] w-[40%] h-[60%] rounded-full bg-[#10b981]/5 dark:bg-[#10b981]/10 blur-[120px]"></div>
      </div>
      {/* Header */}
      <header className="relative z-10 pt-24 pb-10">
        <div className="container mx-auto px-6 md:px-12">
          <Link
            href="/offres"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-[#0ea5e9] dark:hover:text-[#0ea5e9] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux offres
          </Link>

          <div className="flex flex-wrap items-start justify-between">
            <div className="w-full lg:w-2/3">
              <Badge
                variant="outline"
                className="mb-3 bg-[#0ea5e9]/5 text-[#0ea5e9] border-[#0ea5e9]/20 dark:bg-[#0ea5e9]/10 dark:border-[#0ea5e9]/20"
              >
                {offer.category}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                {offer.title}
              </h1>
            </div>
          </div>
        </div>
      </header>{" "}
      {/* Offer Details */}
      <section className="relative z-10 container mx-auto px-6 md:px-12 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            <Card className="border border-gray-200 dark:border-gray-800 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black overflow-hidden mb-8">
              <CardHeader className="border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Description
                </h2>
              </CardHeader>

              <CardContent className="py-6">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {offer.description}
                </p>
              </CardContent>
            </Card>

            {/* Related Offers Card */}
            <Card className="border border-gray-200 dark:border-gray-800 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black overflow-hidden">
              <CardHeader className="border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Offres similaires
                </h2>
              </CardHeader>

              <CardContent className="py-6">
                <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                  Aucune offre similaire trouvée pour le moment.
                </p>
                <div className="mt-4">
                  <Link href="/offres">
                    <Button
                      variant="outline"
                      className="w-full border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      Voir toutes les offres
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Action Card */}
            <Card className="border border-gray-200 dark:border-gray-800 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black sticky top-6">
              <CardContent className="p-6">
                {/* Price and date reminder */}
                <div className="mb-5 pb-5 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      Prix
                    </span>
                    <span className="text-2xl font-bold text-[#0ea5e9]">
                      {offer.price} €
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Publié le{" "}
                    {new Date(offer.createdAt).toLocaleDateString("fr-FR")}
                  </div>
                </div>

                <div className="space-y-4">
                  <Button className="w-full bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] hover:opacity-90 transition-opacity">
                    <Mail className="w-4 h-4 mr-2" />
                    Contacter le prestataire
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Ajouter aux favoris
                  </Button>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
                  <p>
                    Cette offre est disponible depuis{" "}
                    {Math.floor(
                      (new Date().getTime() -
                        new Date(offer.createdAt).getTime()) /
                        (1000 * 3600 * 24)
                    )}{" "}
                    jours
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Author Info */}
            {offer.author && (
              <Card className="border border-gray-200 dark:border-gray-800 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black">
                <CardHeader className="border-b border-gray-200 dark:border-gray-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Proposé par
                  </h3>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    {offer.author.image ? (
                      <img
                        src={offer.author.image}
                        alt={offer.author.name || "Avatar"}
                        className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-[#0ea5e9]/10 flex items-center justify-center text-[#0ea5e9] text-xl font-bold">
                        {(
                          offer.author.name?.charAt(0) ||
                          offer.author.email?.charAt(0) ||
                          "U"
                        ).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {offer.author.name || "Utilisateur anonyme"}
                      </p>
                      {offer.author.email && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {offer.author.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2 text-sm border-gray-300 dark:border-gray-700"
                    >
                      Voir le profil
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
