"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { improveAd } from "@/app/components/AdEditor";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  FileText,
  DollarSign,
  BookOpen,
  Image as ImageIcon,
  Sparkles,
  ChevronLeft,
  Upload,
  Check,
  X,
  Wand2,
  ArrowLeft,
} from "lucide-react";

export default function NewOfferPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [improvedDescription, setImprovedDescription] = useState("");
  const [isImproving, setIsImproving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsImproving(true);
      const improved = await improveAd(
        form.title +
          " " +
          form.description +
          " " +
          form.price +
          " " +
          form.category
      );
      setImprovedDescription(improved);
      setIsImproving(false);
      setShowPopup(true);
    } catch (err) {
      setIsImproving(false);
      alert("Erreur lors de l'amélioration de la description : " + err);
      console.error(err);
    }
  };

  const createOfferWithDescription = async (useImproved: boolean) => {
    try {
      setIsSubmitting(true);
      const finalDescription = useImproved
        ? improvedDescription
        : form.description;
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", finalDescription);
      formData.append("price", form.price);
      formData.append("category", form.category);
      if (image) {
        formData.append("image", image);
      }

      const response = await fetch("/api/offers", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        router.push("/offres");
      } else {
        alert("Erreur lors de la création de la demande.");
      }
    } catch (err) {
      alert("Une erreur est survenue : " + err);
      console.error(err);
    } finally {
      setIsSubmitting(false);
      setShowPopup(false);
    }
  };
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <Link
          href="/offres"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span>Retour aux offres</span>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Créer une nouvelle offre</h1>
        <p className="text-gray-600">
          Remplissez les détails de votre offre de service
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

            <div className="pt-4">
              <Button
                type="submit"
                className="flex items-center gap-2 rounded-full py-2 px-8"
                disabled={isImproving || isSubmitting}
              >
                <Wand2 className="h-4 w-4" />
                {isImproving
                  ? "Amélioration en cours..."
                  : "Améliorer avec l'IA"}
              </Button>
            </div>
          </form>
        </div>

        <div className="md:col-span-1">
          <div className="sticky top-20 space-y-6">
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="text-sm text-gray-600 mb-4">
                Ajoutez une image pour illustrer votre service
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
                  Télécharger une image
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
                <li>
                  • Utilisez l'amélioration IA pour optimiser votre annonce
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Popup d'amélioration IA */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 flex justify-between items-center border-b">
              <div className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-blue-500" />
                <h2 className="text-xl font-bold">
                  Amélioration de votre description
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => setShowPopup(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center text-gray-800">
                    <FileText className="h-4 w-4 mr-2" />
                    Description originale
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-lg border h-full min-h-[200px] overflow-y-auto">
                    <p className="text-gray-800">{form.description}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center text-blue-700">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Description améliorée par l'IA
                  </h3>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 h-full min-h-[200px] overflow-y-auto">
                    <p className="text-gray-800">{improvedDescription}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => createOfferWithDescription(false)}
                className="flex items-center gap-2"
                disabled={isSubmitting}
              >
                <X className="h-4 w-4" />
                Garder l'originale
              </Button>
              <Button
                onClick={() => createOfferWithDescription(true)}
                className="flex items-center gap-2"
                disabled={isSubmitting}
              >
                <Check className="h-4 w-4" />
                Utiliser l'amélioration
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
