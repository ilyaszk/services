'use client';

import AIModal from '@/app/components/AIModal';
import OfferCard from '@/app/components/OfferCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Filter, Loader2, PlusCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

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

  // État pour le modal IA
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);

  const { data: session } = useSession();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteOfferId, setDeleteOfferId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Fonction pour récupérer les offres
  async function fetchOffers() {
    setLoading(true);
    setError(null);

    try {
      // Construction des paramètres de requête pour les filtres
      const params = new URLSearchParams();

      if (selectedCategories.length === 1) {
        params.append('category', selectedCategories[0]);
      }

      if (priceRange < 2000) {
        params.append('maxPrice', priceRange.toString());
      }

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`/api/offers${queryString}`);

      if (!response.ok) {
        throw new Error('Problème lors de la récupération des offres');
      }

      const data: Offer[] = await response.json();
      setOffers(data);

      // Extraire les catégories uniques des offres
      const uniqueCategories = Array.from(new Set(data.map((offer) => offer.category)));
      setCategories(uniqueCategories);
    } catch (err) {
      setError('Erreur lors du chargement des offres');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Gérer les changements de catégories sélectionnées
  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
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

  // Fonction de suppression d'une offre
  async function handleDelete(offerId: string) {
    setDeleteError(null);
    try {
      const response = await fetch(`/api/offers/${offerId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setOffers((prev) => prev.filter((o) => o.id !== offerId));
        setShowDeleteModal(false);
        setDeleteOfferId(null);
      } else {
        setDeleteError("Erreur lors de la suppression de l'offre");
      }
    } catch (err) {
      setDeleteError('Erreur lors de la suppression');
    }
  }

  // Fonction pour ouvrir le modal IA
  const openAIModal = () => {
    setIsAIModalOpen(true);
  };

  // Fonction pour fermer le modal IA
  const closeAIModal = () => {
    setIsAIModalOpen(false);
  };

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
            Trouvez les{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6]">
              services adaptés
            </span>{' '}
            à vos besoins
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-10 max-w-3xl mx-auto">
            Découvrez notre catalogue complet de prestations pour répondre à tous vos besoins
            professionnels
          </p>
          {/* Lien Mes Offres pour les clients */}
          {session?.user?.role === 'Client' && (
            <div className="flex justify-center mb-4">
              <Link href="/offres/mes-offres">
                <Button className="bg-gradient-to-r from-[#10b981] to-[#1e40af] hover:opacity-90 transition-opacity text-white">
                  Mes Offres
                </Button>
              </Link>
            </div>
          )}
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
      <section className="relative z-10 container mx-auto pb-12">
        <div className="flex flex-col gap-8">
          {/* Mobile filter toggle */}
          <div className="lg:hidden">
            <Button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              variant="outline"
              className="w-full border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900"
            >
              <Filter className="w-4 h-4 mr-2" />
              {isFilterOpen ? 'Masquer les filtres' : 'Afficher les filtres'}
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters */}
            <div className={`lg:w-1/4 ${isFilterOpen ? 'block' : 'hidden'} lg:block`}>
              <Card className="border-gray-200 dark:border-gray-800 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black">
                <CardHeader className="border-b border-gray-200 dark:border-gray-800">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Filtres</h2>
                </CardHeader>

                {/* IA Suggestion Button */}
                <div className="flex justify-center px-[3%] w-full">
                  <Button
                    onClick={openAIModal}
                    className="w-[90%] bg-gradient-to-r from-[#8b5cf6] to-[#0ea5e9] hover:opacity-90 transition-opacity text-white"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5 mr-2"
                    >
                      <path d="M12 8V16" />
                      <path d="M8 12H16" />
                      <circle cx="12" cy="12" r="10" />
                      <path d="M22 12c0 5.523-4.477 10-10 10a9.956 9.956 0 0 1-7.156-3" />
                    </svg>
                    Demander à l'IA
                  </Button>
                </div>

                <CardContent className="pt-2">
                  {/* Category filter */}
                  <div className="mb-4 mt-4">
                    <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Catégories
                    </h3>
                    <div className="space-y-4">
                      {categories.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category}`}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={() => handleCategoryChange(category)}
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
                        <span className="text-sm text-gray-600 dark:text-gray-400">0 €</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">2000 €</span>
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
                    <OfferCard
                      key={offer.id}
                      offer={offer}
                      onDelete={() => {
                        setShowDeleteModal(true);
                        setDeleteOfferId(offer.id);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Modale de suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-red-600">Confirmer la suppression</h2>
            <p className="mb-6">
              Voulez-vous vraiment supprimer cette offre ? Cette action est irréversible.
            </p>
            {deleteError && <div className="text-red-500 mb-4">{deleteError}</div>}
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteOfferId(null);
                }}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={() => deleteOfferId && handleDelete(deleteOfferId)}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal IA */}
      <AIModal
        isOpen={isAIModalOpen}
        onClose={closeAIModal}
        categories={categories}
        offers={offers}
        onApplySuggestion={(suggestedCategories) => {
          setSelectedCategories(suggestedCategories);
          applyFilters();
        }}
      />
    </div>
  );
}
