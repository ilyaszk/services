"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  FileText,
  DollarSign,
  BookOpen,
  Image as ImageIcon,
  Sparkles,
  ArrowLeft,
  Upload,
  Save,
  Trash2,
  AlertTriangle,
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

export default function EditOfferPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Fetch the offer data
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
        if (response.status === 404) {
          throw new Error("Cette offre n'existe pas ou a été supprimée");
        }
        throw new Error("Problème lors de la récupération de l'offre");
      }

      const data: Offer = await response.json();
      setOffer(data);
      setForm({
        title: data.title,
        description: data.description,
        price: data.price.toString(),
        category: data.category,
      });
      if (data.image) {
        setPreviewUrl(data.image);
      }
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

  // Check permissions
  useEffect(() => {
    if (session) {
      fetchOffer();
    }
  }, [session, params?.id]);

  // Check authorization
  useEffect(() => {
    if (offer && session?.user) {
      const isAuthorized =
        session.user.role === "Admin" || offer.author?.id === session.user.id;
      if (!isAuthorized) {
        router.push(`/offres/${offer.id}`);
      }
    }
  }, [offer, session, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!offer) return;

    setSaving(true);
    setError(null);

    try {
      // If updating with a new image, need to use FormData
      if (image) {
        const formData = new FormData();
        formData.append("title", form.title);
        formData.append("description", form.description);
        formData.append("price", form.price);
        formData.append("category", form.category);
        formData.append("image", image);

        const response = await fetch(`/api/offers/${offer.id}`, {
          method: "PATCH",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la modification de l'offre");
        }
      } else {
        // Simple JSON update without changing image
        const response = await fetch(`/api/offers/${offer.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title,
            description: form.description,
            price: Number(form.price),
            category: form.category,
          }),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la modification de l'offre");
        }
      }

      router.push(`/offres/${offer.id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur s'est produite lors de la modification"
      );
      console.error(err);
    } finally {
      setSaving(false);
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <Link
          href={`/offres/${offer.id}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span>Retour à l'offre</span>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Modifier l'offre</h1>
        <p className="text-gray-600">
          Modifiez les détails de votre offre de service
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="title"
                  className="flex items-center mb-2 font-medium"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Titre
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Nom de votre service"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full"
                  required
                />
              </div>

              <div>
                <Label
                  htmlFor="description"
                  className="flex items-center mb-2 font-medium"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Décrivez en détail votre service"
                  value={form.description}
                  onChange={handleChange}
                  className="w-full min-h-[150px]"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="price"
                    className="flex items-center mb-2 font-medium"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Prix
                  </Label>
                  <div className="relative">
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      placeholder="Prix"
                      value={form.price}
                      onChange={handleChange}
                      className="w-full pl-8"
                      required
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      €
                    </span>
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="category"
                    className="flex items-center mb-2 font-medium"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Catégorie
                  </Label>
                  <Input
                    id="category"
                    name="category"
                    placeholder="Catégorie"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <Button
                type="submit"
                className="flex items-center gap-2 py-2 px-8"
                disabled={saving}
              >
                <Save className="h-4 w-4" />
                {saving ? "Enregistrement..." : "Enregistrer les modifications"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => router.push(`/offres/${offer.id}`)}
              >
                <ArrowLeft className="h-4 w-4" />
                Annuler
              </Button>

              <Button
                type="button"
                variant="destructive"
                className="flex items-center gap-2 ml-auto"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </Button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}
          </form>
        </div>

        <div className="md:col-span-1">
          <div className="sticky top-20 space-y-6">
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="text-sm text-gray-600 mb-4">
                Image de votre service
              </p>

              <div className="space-y-4">
                <div
                  className={`h-48 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-100 overflow-hidden ${
                    previewUrl ? "border-none" : ""
                  }`}
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">
                        Aucune image sélectionnée
                      </p>
                    </div>
                  )}
                </div>

                <Label
                  htmlFor="image-upload"
                  className="inline-flex items-center justify-center gap-2 border border-blue-500 text-blue-500 hover:bg-blue-50 rounded-md px-4 py-2 w-full cursor-pointer text-center transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  Changer l'image
                </Label>
                <Input
                  id="image-upload"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-blue-50">
              <h3 className="font-medium mb-2 flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
                Conseils
              </h3>
              <ul className="text-sm space-y-2 text-gray-700">
                <li>• Soyez précis dans la description de votre service</li>
                <li>
                  • Ajoutez une image attractive pour illustrer votre offre
                </li>
                <li>• Indiquez un prix cohérent avec le marché</li>
                <li>• Vérifiez la catégorie pour une meilleure visibilité</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4 text-red-600">
                <Trash2 size={24} />
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
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                >
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
        </div>
      )}
    </div>
  );
}
