"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Offer {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  author?: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // États pour les filtres
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(2000);

  // Fonction pour récupérer les offres
  async function fetchOffers() {
    setLoading(true);
    setError(null);

    try {
      // Construction des paramètres de requête pour les filtres
      const params = new URLSearchParams();

      if (selectedCategories.length === 1) {
        params.append("category", selectedCategories[0]);
      }

      if (priceRange < 2000) {
        params.append("maxPrice", priceRange.toString());
      }

      const queryString = params.toString() ? `?${params.toString()}` : "";
      const response = await fetch(`/api/offers${queryString}`);

      if (!response.ok) {
        throw new Error("Problème lors de la récupération des offres");
      }

      const data: Offer[] = await response.json();
      setOffers(data);

      // Extraire les catégories uniques des offres
      const uniqueCategories = Array.from(
        new Set(data.map((offer) => offer.category))
      );
      setCategories(uniqueCategories);
    } catch (err) {
      setError("Erreur lors du chargement des offres");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Gérer les changements de catégories sélectionnées
  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Appliquer les filtres
  const applyFilters = () => {
    fetchOffers();
  };

  // Charger les offres au chargement initial de la page
  useEffect(() => {
    fetchOffers();
  }, []);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="container mx-auto px-6 md:px-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Nos offres de services
          </h1>
          <p className="text-lg md:text-xl max-w-2xl">
            Découvrez notre catalogue complet de prestations pour répondre à
            tous vos besoins professionnels.
          </p>
        </div>
      </header>{" "}
      {/* Filters and Offers */}
      <section className="container mx-auto px-6 md:px-12 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters */}
          <div className="lg:w-1/4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Filtres
              </h2>

              {/* Category filter */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Catégories
                </h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`category-${category}`}
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label
                        htmlFor={`category-${category}`}
                        className="ml-2 text-gray-700 dark:text-gray-300"
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price filter */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Prix (max: {priceRange} €)
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="range"
                      min="0"
                      max="2000"
                      step="100"
                      value={priceRange}
                      onChange={(e) => setPriceRange(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      0 €
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      2000 €
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={applyFilters}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Appliquer les filtres
              </button>
            </div>
          </div>

          {/* Offers Grid */}
          <div className="lg:w-3/4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                <p>{error}</p>
              </div>
            ) : offers.length === 0 ? (
              <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative">
                <p>Aucune offre ne correspond à vos critères de recherche.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden transition-transform hover:transform hover:scale-105"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                          {offer.category}
                        </span>
                        <span className="text-gray-900 dark:text-white font-bold">
                          {offer.price} €
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {offer.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {offer.description}
                      </p>
                      {offer.author && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                          Proposé par: {offer.author.name || offer.author.email}
                        </p>
                      )}
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors">
                        Voir les détails
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>{" "}
      {/* Footer */}
    </div>
  );
}
