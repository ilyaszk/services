"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, XCircle } from "lucide-react";

interface Offer {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
}

export default function MesOffresPage() {
  const { data: session, status } = useSession();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteOfferId, setDeleteOfferId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetch(`/api/offers?authorId=${session.user.id}`)
        .then((res) => res.json())
        .then((data) => {
          setOffers(data.filter((o: any) => o.author?.id === session.user.id));
          setLoading(false);
        })
        .catch(() => {
          setError("Erreur lors du chargement de vos offres");
          setLoading(false);
        });
    } else if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, session, router]);

  async function handleDelete(offerId: string) {
    setDeleteError(null);
    try {
      const response = await fetch(`/api/offers/${offerId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setOffers((prev) => prev.filter((o) => o.id !== offerId));
        setShowDeleteModal(false);
        setDeleteOfferId(null);
      } else {
        setDeleteError("Erreur lors de la suppression de l'offre");
      }
    } catch (err) {
      setDeleteError("Erreur lors de la suppression");
    }
  }

  if (loading) return <div className="p-8 text-center">Chargement...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-6 py-12 mt-24">
      <h1 className="text-3xl font-bold mb-6">Mes Offres</h1>
      {offers.length === 0 ? (
        <div className="text-gray-500">Vous n'avez pas encore créé d'offres.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <Card key={offer.id} className="relative">
              <button
                title="Modifier"
                className="absolute top-2 left-2 z-10 bg-white/80 dark:bg-black/80 rounded-full p-1 hover:bg-blue-100 dark:hover:bg-blue-900"
                onClick={() => router.push(`/offres/${offer.id}?edit=1`)}
              >
                <Pencil className="w-5 h-5 text-blue-600" />
              </button>
              <button
                title="Supprimer"
                className="absolute top-2 right-2 z-10 bg-white/80 dark:bg-black/80 rounded-full p-1 hover:bg-red-100 dark:hover:bg-red-900"
                onClick={() => { setShowDeleteModal(true); setDeleteOfferId(offer.id); }}
              >
                <XCircle className="w-5 h-5 text-red-600" />
              </button>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-900 dark:text-white font-bold">
                    {offer.price} €
                  </span>
                  <span className="bg-blue-100 text-[#1e40af] text-sm font-medium px-3 py-1 rounded-full dark:bg-blue-900 dark:text-blue-300">
                    {offer.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {offer.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                  {offer.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
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
                onClick={() => { setShowDeleteModal(false); setDeleteOfferId(null); }}
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
    </div>
  );
} 