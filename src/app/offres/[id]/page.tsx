"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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

    try {
      const response = await fetch(`/api/offers/${params.id}`);

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
    if (params.id) {
      fetchOffer();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600">
          {" "}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md">
          <h2 className="text-xl font-bold mb-2"> Erreur </h2>
          <p> {error} </p>
          <Link
            href="/offres"
            className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Retour aux offres
          </Link>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-6 py-4 rounded-lg max-w-md">
          <h2 className="text-xl font-bold mb-2"> Offre non trouvée </h2>
          <p> Cette offre n'existe pas ou a été supprimée.</p>
          <Link
            href="/offres"
            className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Retour aux offres
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] text-white py-8">
        <div className="container mx-auto px-6 md:px-12">
          {" "}
          <Link
            href="/offres"
            className="inline-flex items-center text-blue-100 hover:text-white mb-4 transition-colors"
          >
            ← Retour aux offres
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold">{offer.title}</h1>
        </div>
      </header>

      {/* Offer Details */}
      <section className="container mx-auto px-6 md:px-12 py-12">
        <div className="max-w-4xl mx-auto">
          {" "}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg shadow-gray-200/50 dark:shadow-none overflow-hidden">
            <div className="p-8">
              {/* Header Info */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                  <span className="bg-blue-100 text-[#1e40af] text-sm font-medium px-3 py-1 rounded-full dark:bg-blue-900 dark:text-blue-300">
                    {offer.category}
                  </span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {offer.price} €
                  </span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Publié le{" "}
                  {new Date(offer.createdAt).toLocaleDateString("fr-FR")}
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Description
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {offer.description}
                </p>
              </div>

              {/* Author Info */}
              {offer.author && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Proposé par
                  </h3>
                  <div className="flex items-center gap-4">
                    {offer.author.image && (
                      <img
                        src={offer.author.image}
                        alt={offer.author.name || "Avatar"}
                        className="w-12 h-12 rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {offer.author.name || "Utilisateur anonyme"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {offer.author.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button className="bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] hover:opacity-90 text-white py-3 px-6 rounded-lg font-medium transition-colors">
                  Contacter le prestataire
                </button>
                <button className="border border-gray-300 hover:bg-gray-50 text-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 py-3 px-6 rounded-lg font-medium transition-colors">
                  Ajouter aux favoris
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
