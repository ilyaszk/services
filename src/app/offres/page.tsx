"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { PlusCircle, Filter, Loader2 } from "lucide-react";

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
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

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
    setIsFilterOpen(false);
  };

  // Charger les offres au chargement initial de la page
  useEffect(() => {
    fetchOffers();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[30%] -left-[10%] w-[40%] h-[70%] rounded-full bg-[#1e40af]/5 dark:bg-[#1e40af]/10 blur-[120px]"></div>
        <div className="absolute top-[50%] -right-[10%] w-[40%] h-[60%] rounded-full bg-[#10b981]/5 dark:bg-[#10b981]/10 blur-[120px]"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 pt-32 pb-16 overflow-hidden">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex justify-center mb-6">
            <Badge
              variant="outline"
              className="border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-black/50 text-gray-700 dark:text-gray-300 px-4 py-1 rounded-full text-sm"
            >
              Catalogue de services
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            Trouvez les{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6]">
              services adaptés
            </span>{" "}
            à vos besoins
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-10 max-w-3xl mx-auto">
            Découvrez notre catalogue complet de prestations pour répondre à
            tous vos besoins professionnels
          </p>
        </div>

        {/* Nouvelle demande */}
        <div className="container mx-auto px-6 md:px-12 flex justify-center sm:justify-end">
          <Link href="/offres/new">
            <Button className="bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] hover:opacity-90 transition-opacity text-white">
              <PlusCircle className="w-4 h-4 mr-2" />
              Nouvelle demande
            </Button>
          </Link>
        </div>
      </header>

      {/* Filters and Offers */}
      <section className="relative z-10 container mx-auto px-6 md:px-12 py-12">
        <div className="flex flex-col gap-8">
          {/* Mobile filter toggle */}
          <div className="lg:hidden">
            <Button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              variant="outline"
              className="w-full border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900"
            >
              <Filter className="w-4 h-4 mr-2" />
              {isFilterOpen ? "Masquer les filtres" : "Afficher les filtres"}
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters */}
            <div
              className={`lg:w-1/4 ${
                isFilterOpen ? "block" : "hidden"
              } lg:block`}
            >
              <Card className="border-gray-200 dark:border-gray-800 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black">
                <CardHeader className="border-b border-gray-200 dark:border-gray-800">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Filtres
                  </h2>
                </CardHeader>
                <CardContent className="pt-6">
                  {/* Category filter */}
                  <div className="mb-6">
                    <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Catégories
                    </h3>
                    <div className="space-y-4">
                      {categories.map((category) => (
                        <div
                          key={category}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`category-${category}`}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={() =>
                              handleCategoryChange(category)
                            }
                            className="border-gray-300 dark:border-gray-700 data-[state=checked]:bg-[#0ea5e9] data-[state=checked]:border-[#0ea5e9]"
                          />
                          <label
                            htmlFor={`category-${category}`}
                            className="text-gray-700 dark:text-gray-300 text-sm"
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
                    <div className="space-y-4">
                      <Slider
                        min={0}
                        max={2000}
                        step={100}
                        value={[priceRange]}
                        onValueChange={(value) => setPriceRange(value[0])}
                        className="w-full"
                      />
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
                </CardContent>
                <CardFooter className="border-t border-gray-200 dark:border-gray-800 pt-4">
                  <Button
                    onClick={applyFilters}
                    className="w-full bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] hover:opacity-90 transition-opacity"
                  >
                    Appliquer les filtres
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Offers Grid */}
            <div className="lg:w-3/4 w-full">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-12 w-12 animate-spin text-[#0ea5e9]" />
                </div>
              ) : error ? (
                <Card className="border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20">
                  <CardContent className="p-6">
                    <p className="text-red-600 dark:text-red-300">{error}</p>
                  </CardContent>
                </Card>
              ) : offers.length === 0 ? (
                <Card className="border-[#0ea5e9]/30 bg-[#0ea5e9]/5 dark:bg-[#0ea5e9]/10">
                  <CardContent className="p-6">
                    <p className="text-[#0ea5e9]">
                      Aucune offre ne correspond à vos critères de recherche.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {offers.map((offer) => (
                    <Card
                      key={offer.id}
                      className="border border-gray-200 dark:border-gray-800 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-lg hover:shadow-[#0ea5e9]/5 dark:hover:shadow-[#0ea5e9]/10"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <Badge
                            variant="outline"
                            className="bg-[#0ea5e9]/5 text-[#0ea5e9] border-[#0ea5e9]/20 dark:bg-[#0ea5e9]/10 dark:border-[#0ea5e9]/20"
                          >
                            {offer.category}
                          </Badge>
                          <span className="text-gray-900 dark:text-white font-bold">
                            {offer.price} €
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                          {offer.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                          {offer.description}
                        </p>
                        {offer.author && (
                          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                            Proposé par:{" "}
                            {offer.author.name || offer.author.email}
                          </p>
                        )}
                      </CardContent>
                      <CardFooter className="border-t border-gray-200 dark:border-gray-800 p-4">
                        <Link href={`/offres/${offer.id}`} className="w-full">
                          <Button
                            variant="outline"
                            className="w-full border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            Voir les détails
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
