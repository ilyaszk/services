'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  BookOpen,
  ChevronLeft,
  Clock,
  DollarSign,
  Eye,
  FileText,
  Image,
  Languages,
  Mail,
  MessageSquare,
  Pencil,
  Star,
  Trash2,
  User,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Offer {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image?: string | null;
  createdAt: string;
  author?: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export default function OfferDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // State for translation feature
  const [file, setFile] = useState<File | null>(null);
  const [translatedText, setTranslatedText] = useState('');
  const [translationError, setTranslationError] = useState('');

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  async function fetchOffer() {
    setLoading(true);
    setError(null);
    const offerId = params?.id;
    if (!offerId) {
      setError("ID de l'offre manquant");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`/api/offers/${offerId}`);
      if (!response.ok) {
        if (response.status === 404) throw new Error("Cette offre n'existe pas ou a été supprimée");
        throw new Error("Problème lors de la récupération de l'offre");
      }
      const data: Offer = await response.json();
      setOffer(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement de l'offre");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (params?.id) {
      fetchOffer();
      fetchReviews(); // Ajouter cette ligne
    }
  }, [params]);

  async function fetchReviews() {
    const offerId = params?.id;
    if (!offerId) return;

    try {
      const response = await fetch(`/api/offers/${offerId}/reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
        setReviewStats(data.stats);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des avis:', error);
    }
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewLoading(true);
    setReviewError(null);

    try {
      const response = await fetch(`/api/offers/${offer?.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReview),
      });

      if (response.ok) {
        setNewReview({ rating: 5, comment: '' });
        setShowReviewForm(false);
        await fetchReviews(); // Recharger les avis
      } else {
        const error = await response.json();
        setReviewError(error.message || "Erreur lors de l'ajout de l'avis");
      }
    } catch (error) {
      setReviewError("Erreur lors de l'ajout de l'avis");
    } finally {
      setReviewLoading(false);
    }
  };

  async function handleDelete() {
    setDeleteError(null);
    try {
      const response = await fetch(`/api/offers/${offer?.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setShowDeleteModal(false);
        router.push('/offres');
      } else {
        setDeleteError("Erreur lors de la suppression de l'offre");
      }
    } catch (err) {
      setDeleteError('Erreur lors de la suppression');
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const StarRating = ({
    rating,
    onRatingChange,
    readonly = false,
  }: {
    rating: number;
    onRatingChange?: (rating: number) => void;
    readonly?: boolean;
  }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onRatingChange?.(star)}
            className={`${
              star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
            } ${!readonly ? 'hover:text-yellow-400 cursor-pointer' : 'cursor-default'}`}
          >
            <Star size={20} fill={star <= rating ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>
    );
  };

  const handleTranslateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTranslationError('');
    setTranslatedText('');
    if (!file) {
      setTranslationError('Please select a file');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to translate');
      }
      const data = await response.json();
      setTranslatedText(data.translatedText);
    } catch (err) {
      setTranslationError('An error occurred while translating the file.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md">
          <h2 className="text-xl font-bold mb-2">Erreur</h2>
          <p>{error}</p>
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
          <h2 className="text-xl font-bold mb-2">Offre non trouvée</h2>
          <p>Cette offre n'existe pas ou a été supprimée.</p>
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
      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/offres"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
          >
            <ChevronLeft size={20} />
            Retour aux offres
          </Link>
        </div>

        {/* Header avec titre et informations clés */}
        <div className="max-w-6xl mx-auto mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
            {offer.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-12 gap-y-6 mb-8">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center text-white">
                <DollarSign size={22} />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Prix</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {offer.price} €
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 w-12 h-12 rounded-full flex items-center justify-center text-white">
                <BookOpen size={22} />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Catégorie</div>
                <div className="text-gray-900 dark:text-white font-medium">{offer.category}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-emerald-600 w-12 h-12 rounded-full flex items-center justify-center text-white">
                <Clock size={22} />
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Publié le</div>
                <div className="text-gray-900 dark:text-white font-medium">
                  {new Date(offer.createdAt).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>

            {session?.user &&
              (session.user.role === 'Admin' || offer.author?.id === session.user.id) && (
                <div className="flex gap-3 ml-auto">
                  <Link
                    href={`/offres/${offer.id}/edit`}
                    className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium border border-blue-200 bg-blue-50 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 dark:hover:text-blue-300 rounded-lg px-4 py-2 transition-colors"
                  >
                    <Pencil size={18} />
                    Modifier
                  </Link>
                  <button
                    className="flex items-center gap-1.5 text-red-600 hover:text-red-800 font-medium border border-red-200 bg-red-50 hover:bg-red-100 dark:border-red-900 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 dark:hover:text-red-300 rounded-lg px-4 py-2 transition-colors"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    <Trash2 size={18} />
                    Supprimer
                  </button>
                </div>
              )}
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Colonne principale avec description et image */}
          <div className="lg:col-span-2 space-y-10">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FileText size={20} className="mr-2" />
                Description
              </h2>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <p className="text-gray-700 dark:text-gray-200 leading-relaxed text-lg">
                  {offer.description}
                </p>
              </div>
            </div>

            {offer.image ? (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Image size={20} className="mr-2" />
                  Photo
                </h2>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-auto rounded-lg shadow-md"
                  />
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Image size={20} className="mr-2" />
                  Photo
                </h2>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 py-12">
                  <Image size={48} className="mb-4 opacity-50" />
                  <p className="text-lg font-medium">Aucune image disponible pour cette offre</p>
                </div>
              </div>
            )}

            {offer.title === 'Translate File' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Languages size={20} className="mr-2" />
                  Utiliser ce service
                </h2>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                  <form onSubmit={handleTranslateSubmit} className="space-y-5">
                    <div>
                      <Label
                        htmlFor="file"
                        className="text-gray-700 dark:text-gray-200 mb-2 block font-medium"
                      >
                        Fichier à traduire
                      </Label>
                      <Input
                        id="file"
                        type="file"
                        onChange={handleFileChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5"
                    >
                      <Languages size={16} className="mr-2" />
                      Traduire
                    </Button>
                  </form>
                  {translationError && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">
                      <p className="flex items-center">
                        <Eye size={16} className="mr-2" />
                        {translationError}
                      </p>
                    </div>
                  )}
                  {translatedText && (
                    <div className="mt-6 p-6 border border-blue-100 dark:border-blue-900/30 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 flex items-center">
                        <Languages size={20} className="mr-2" />
                        Texte traduit
                      </h2>
                      <Textarea
                        value={translatedText as string}
                        readOnly
                        rows={10}
                        className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Colonne latérale avec auteur et actions */}
          <div className="space-y-8">
            {/* Auteur */}
            {offer.author && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <User size={20} className="mr-2" />
                  Proposé par
                </h3>
                <div className="flex items-center gap-4">
                  {offer.author.image ? (
                    <img
                      src={offer.author.image}
                      alt={offer.author.name || 'Avatar'}
                      className="w-16 h-16 rounded-full border-2 border-white dark:border-gray-800 shadow-md"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <User size={24} className="text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {offer.author.name || 'Utilisateur'}
                    </p>
                    {offer.author.email && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                        <Mail size={14} className="mr-1" />
                        {offer.author.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {offer.author && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Actions rapides
                </h3>
                <div className="space-y-3">
                  <Link
                    href={`/conversations/new/${offer.id}`}
                    className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
                  >
                    <MessageSquare size={16} />
                    Contacter le prestataire
                  </Link>
                </div>
              </div>
            )}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <Star size={20} className="mr-2" />
                  Avis {reviewStats && `(${reviewStats.totalReviews})`}
                  {reviewStats && reviewStats.totalReviews > 0 && (
                    <span className="ml-2 text-yellow-500 flex items-center">
                      <Star size={16} className="mr-1" fill="currentColor" />
                      {reviewStats.averageRating} / 5
                    </span>
                  )}
                </h2>

                {session?.user && offer.author?.id !== session.user.id && (
                  <Button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Laisser un avis
                  </Button>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                {/* Statistiques des avis */}
                {reviewStats && reviewStats.totalReviews > 0 && (
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                          {reviewStats.averageRating} / 5
                        </div>
                        <StarRating rating={Math.round(reviewStats.averageRating)} readonly />
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                          Basé sur {reviewStats.totalReviews} avis
                        </p>
                      </div>
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <div key={rating} className="flex items-center gap-3">
                            <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                              {rating}★
                            </span>
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-yellow-400 h-2 rounded-full"
                                style={{
                                  width: `${
                                    reviewStats.totalReviews > 0
                                      ? (reviewStats.ratingDistribution[
                                          rating as keyof typeof reviewStats.ratingDistribution
                                        ] /
                                          reviewStats.totalReviews) *
                                        100
                                      : 0
                                  }%`,
                                }}
                              >
                                {' '}
                              </div>
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                              {
                                reviewStats.ratingDistribution[
                                  rating as keyof typeof reviewStats.ratingDistribution
                                ]
                              }
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {showReviewForm && (
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <div>
                        <Label className="text-gray-700 dark:text-gray-200 mb-2 block">Note</Label>
                        <StarRating
                          rating={newReview.rating}
                          onRatingChange={(rating) => setNewReview({ ...newReview, rating })}
                        />
                      </div>
                      <div>
                        <Label className="text-gray-700 dark:text-gray-200 mb-2 block">
                          Commentaire(optionnel)
                        </Label>
                        <Textarea
                          value={newReview.comment}
                          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                          placeholder="Partagez votre expérience..."
                          rows={4}
                        />
                      </div>
                      {reviewError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">
                          {reviewError}
                        </div>
                      )}
                      <div className="flex gap-3">
                        <Button
                          type="submit"
                          disabled={reviewLoading}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {reviewLoading ? 'Envoi...' : "Publier l'avis"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowReviewForm(false)}
                        >
                          Annuler
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Liste des avis */}
                <div className="p-6">
                  {reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div
                          key={review.id}
                          className="border-b border-gray-100 dark:border-gray-700 last:border-b-0 pb-6 last:pb-0"
                        >
                          <div className="flex items-start gap-4">
                            {review.user.image ? (
                              <img
                                src={review.user.image}
                                alt={review.user.name || 'Avatar'}
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <User size={20} className="text-gray-500 dark:text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {review.user.name || 'Utilisateur'}
                                </span>
                                <StarRating rating={review.rating} readonly />
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                              {review.comment && (
                                <p className="text-gray-700 dark:text-gray-200">{review.comment}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Star size={32} className="mx-auto mb-3 opacity-50" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Avis Section */}
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 max-w-md w-full mx-4 animate-fade-in">
            <div className="flex items-center gap-4 mb-4 text-red-600">
              <Trash2 size={24} />
              <h2 className="text-xl font-bold">Confirmer la suppression</h2>
            </div>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Voulez-vous vraiment supprimer cette offre ? Cette action est irréversible.
            </p>
            {deleteError && (
              <div className="p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg text-red-600 dark:text-red-400">
                {deleteError}
              </div>
            )}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
