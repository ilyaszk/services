"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  DollarSign,
  BookOpen,
  Clock,
  Pencil,
  Trash2,
  Image,
  Languages,
  MessageSquare,
  Heart,
  Share,
  User,
  Mail,
  Eye,
  Star,
  FileText
} from "lucide-react";

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

export default function OfferDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: 0,
    category: "",
    image: "",
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // State for translation feature
  const [file, setFile] = useState<File | null>(null);
  const [translatedText, setTranslatedText] = useState("");
  const [translationError, setTranslationError] = useState("");

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
        if (response.status === 404)
          throw new Error("Cette offre n'existe pas ou a été supprimée");
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

  useEffect(() => {
    if (params?.id) {
      fetchOffer();
    }
  }, [params]);

  useEffect(() => {
    if (offer) {
      setForm({
        title: offer.title,
        description: offer.description,
        price: offer.price,
        category: offer.category,
        image: offer.image || "",
      });
    }
  }, [offer]);

  useEffect(() => {
    if (
      searchParams?.get("edit") === "1" &&
      offer &&
      session?.user &&
      (session.user.role === "Admin" || offer.author?.id === session.user.id)
    ) {
      setEditMode(true);
    } else {
      setEditMode(false);
    }
  }, [searchParams, offer, session]);

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const response = await fetch(`/api/offers/${offer?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form }),
      });
      if (response.ok) {
        setEditMode(false);
        router.push(`/offres/${offer?.id}`);
        fetchOffer();
      } else {
        alert("Erreur lors de la modification");
      }
    } catch (err) {
      alert("Erreur lors de la modification");
    }
  }

  async function handleDelete() {
    setDeleteError(null);
    try {
      const response = await fetch(`/api/offers/${offer?.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setShowDeleteModal(false);
        router.push("/offres");
      } else {
        setDeleteError("Erreur lors de la suppression de l'offre");
      }
    } catch (err) {
      setDeleteError("Erreur lors de la suppression");
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleTranslateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTranslationError("");
    setTranslatedText("");
    if (!file) {
      setTranslationError("Please select a file");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to translate");
      }
      const data = await response.json();
      setTranslatedText(data.translatedText);
    } catch (err) {
      setTranslationError("An error occurred while translating the file.");
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
          >            <ChevronLeft size={20} />
            Retour aux offres
          </Link>
        </div>

        {editMode ? (
          <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              Modifier l'offre
            </h2>
            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="title"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Titre
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  className="w-full p-2.5"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={6}
                  className="w-full p-2.5 resize-y"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="price"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Prix (€)
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price: Number(e.target.value) }))
                    }
                    className="w-full p-2.5"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="category"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Catégorie
                  </Label>
                  <Input
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category: e.target.value }))
                    }
                    className="w-full p-2.5"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Enregistrer les modifications
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditMode(false)}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {/* Header avec titre et informations clés */}
            <div className="max-w-6xl mx-auto mb-12">
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
                {offer.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-12 gap-y-6 mb-8">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center text-white">                    <DollarSign size={22} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Prix
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {offer.price} €
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="bg-indigo-600 w-12 h-12 rounded-full flex items-center justify-center text-white">                    <BookOpen size={22} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Catégorie
                    </div>
                    <div className="text-gray-900 dark:text-white font-medium">
                      {offer.category}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="bg-emerald-600 w-12 h-12 rounded-full flex items-center justify-center text-white">                    <Clock size={22} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Publié le
                    </div>
                    <div className="text-gray-900 dark:text-white font-medium">
                      {new Date(offer.createdAt).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                </div>

                {session?.user &&
                  (session.user.role === "Admin" ||
                    offer.author?.id === session.user.id) && (
                    <div className="flex gap-3 ml-auto">
                      <button
                        className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium border border-blue-200 bg-blue-50 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 dark:hover:text-blue-300 rounded-lg px-4 py-2 transition-colors"
                        onClick={() => {
                          const url = new URL(window.location.href);
                          url.searchParams.set("edit", "1");
                          window.location.href = url.toString();
                        }}
                      >                        <Pencil size={18} />
                        Modifier
                      </button>
                      <button
                        className="flex items-center gap-1.5 text-red-600 hover:text-red-800 font-medium border border-red-200 bg-red-50 hover:bg-red-100 dark:border-red-900 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 dark:hover:text-red-300 rounded-lg px-4 py-2 transition-colors"
                        onClick={() => setShowDeleteModal(true)}
                      >                        <Trash2 size={18} />
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
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">                    <FileText size={20} className="mr-2" />
                    Description
                  </h2>
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                    <p className="text-gray-700 dark:text-gray-200 leading-relaxed text-lg">
                      {offer.description}
                    </p>
                  </div>
                </div>

                {offer.image && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">                      <Image size={20} className="mr-2" />
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
                )}

                {offer.title === "Translate File" && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">                      <Languages size={20} className="mr-2" />
                      Utiliser ce service
                    </h2>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                      <form
                        onSubmit={handleTranslateSubmit}
                        className="space-y-5"
                      >
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
                        >                          <Languages size={16} className="mr-2" />
                          Traduire
                        </Button>
                      </form>
                      {translationError && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">
                          <p className="flex items-center">                            <Eye size={16} className="mr-2" />
                            {translationError}
                          </p>
                        </div>
                      )}
                      {translatedText && (
                        <div className="mt-6 p-6 border border-blue-100 dark:border-blue-900/30 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100 flex items-center">                            <Languages size={20} className="mr-2" />
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
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">                      <User size={20} className="mr-2" />
                      Proposé par
                    </h3>
                    <div className="flex items-center gap-4">
                      {offer.author.image ? (
                        <img
                          src={offer.author.image}
                          alt={offer.author.name || "Avatar"}
                          className="w-16 h-16 rounded-full border-2 border-white dark:border-gray-800 shadow-md"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-xl font-bold text-blue-600 dark:text-blue-300 uppercase">
                          {(offer.author.name || "?")[0]}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-lg">
                          {offer.author.name || "Utilisateur anonyme"}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">                          <Mail size={14} className="mr-1" />
                          {offer.author.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {!offer.title.includes("Translate File") && (
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Actions rapides
                    </h3>
                    <div className="space-y-3">
                      {(!session?.user ||
                        offer.author?.id !== session.user.id) && (
                        <Link
                          href={`/conversations/new/${offer.id}`}
                          className="w-full"
                        >
                          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center">                            <MessageSquare size={18} className="mr-2" />
                            Contacter le prestataire
                          </button>
                        </Link>
                      )}

                      <button className="w-full border border-gray-200 hover:bg-gray-50 text-gray-700 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center">                        <Heart size={18} className="mr-2" />
                        Ajouter aux favoris
                      </button>

                      <button className="w-full border border-gray-200 hover:bg-gray-50 text-gray-700 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center">                        <Share size={18} className="mr-2" />
                        Partager cette offre
                      </button>
                    </div>
                  </div>
                )}

                {/* Recommandations */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Informations supplémentaires
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">                      <Heart size={16} />
                      <span>
                        Recommandé par {Math.floor(Math.random() * 50) + 5}{" "}
                        utilisateurs
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">                      <Eye size={16} />
                      <span>
                        Consulté {Math.floor(Math.random() * 500) + 50} fois
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">                      <Star size={16} />
                      <span>
                        Note moyenne: {(Math.random() * 2 + 3).toFixed(1)}/5
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 max-w-md w-full mx-4 animate-fade-in">
            <div className="flex items-center gap-4 mb-4 text-red-600">              <Trash2 size={24} />
              <h2 className="text-xl font-bold">Confirmer la suppression</h2>
            </div>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Voulez-vous vraiment supprimer cette offre ? Cette action est
              irréversible.
            </p>
            {deleteError && (
              <div className="p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg text-red-600 dark:text-red-400">
                {deleteError}
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 transition-colors"
                onClick={() => setShowDeleteModal(false)}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                onClick={handleDelete}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
