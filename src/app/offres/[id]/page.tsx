"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

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
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
      });
    }
  }, [offer]);

  useEffect(() => {
    // Activer le mode édition si ?edit=1 et droits
    if (
      searchParams.get("edit") === "1" &&
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
        router.push("/offres");
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
              {editMode ? (
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <input
                    className="w-full p-2 border rounded"
                    name="title"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    required
                  />
                  <textarea
                    className="w-full p-2 border rounded"
                    name="description"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={4}
                    required
                  />
                  <input
                    className="w-full p-2 border rounded"
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                    required
                  />
                  <input
                    className="w-full p-2 border rounded"
                    name="category"
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    required
                  />
                  <div className="flex gap-4">
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Enregistrer</button>
                    <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setEditMode(false)}>Annuler</button>
                  </div>
                </form>
              ) : (
                <>
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
                  <div className="flex flex-col sm:flex-row gap-4 mt-8 items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button className="bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] hover:opacity-90 text-white py-3 px-6 rounded-lg font-medium transition-colors">
                        Contacter le prestataire
                      </button>
                      <button className="border border-gray-300 hover:bg-gray-50 text-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 py-3 px-6 rounded-lg font-medium transition-colors">
                        Ajouter aux favoris
                      </button>
                    </div>
                    {(!editMode && session?.user && (session.user.role === "Admin" || offer.author?.id === session.user.id)) && (
                      <div className="flex gap-2 items-center">
                        <button
                          className="ml-auto border border-[#0ea5e9] text-[#0ea5e9] bg-white hover:bg-[#e0f2fe] py-3 px-6 rounded-lg font-medium transition-colors"
                          style={{ minWidth: 120 }}
                          onClick={() => {
                            const url = new URL(window.location.href);
                            url.searchParams.set("edit", "1");
                            window.location.href = url.toString();
                          }}
                        >
                          Modifier
                        </button>
                        <button
                          className="ml-2 border border-red-500 text-red-500 bg-white hover:bg-red-50 py-3 px-6 rounded-lg font-medium transition-colors"
                          style={{ minWidth: 120 }}
                          onClick={() => setShowDeleteModal(true)}
                        >
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </>
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
            <p className="mb-6">Voulez-vous vraiment supprimer cette offre ? Cette action est irréversible.</p>
            {deleteError && <div className="text-red-500 mb-4">{deleteError}</div>}
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
                onClick={() => setShowDeleteModal(false)}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
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
