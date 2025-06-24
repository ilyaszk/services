"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { improveAd } from "@/app/components/AdEditor";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export default function NewOfferPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
  });
  const [showPopup, setShowPopup] = useState(false);
  const [improvedDescription, setImprovedDescription] = useState("");
  const [isImproving, setIsImproving] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsImproving(true);
      // Améliorer la description et afficher la popup
      const improved = await improveAd(
        form.title + form.description + form.price + form.price
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
      const finalDescription = useImproved
        ? improvedDescription
        : form.description;

      const response = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          description: finalDescription,
        }),
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
      setShowPopup(false);
    }
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
              Nouvelle demande
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            Créer votre{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6]">
              nouvelle demande
            </span>{" "}
            de service
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-10 max-w-3xl mx-auto">
            Décrivez précisément votre besoin pour obtenir les meilleures
            propositions
          </p>
        </div>
        <div className="container mx-auto px-6 md:px-12 flex justify-center sm:justify-end">
          <Link href="/offres">
            <Button
              variant="outline"
              className="border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300"
            >
              Retour à la liste des offres
            </Button>
          </Link>
        </div>
      </header>

      {/* Form */}
      <section className="relative z-10 container mx-auto px-6 pb-12">
        <Card className="border-gray-200 dark:border-gray-800 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black max-w-3xl mx-auto">
          <CardHeader className="border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Détails de votre demande
            </h2>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Titre
                </label>
                <input
                  name="title"
                  placeholder="Titre de votre offre"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  name="description"
                  placeholder="Description détaillée de votre demande"
                  value={form.description}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  rows={4}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Prix (€)
                  </label>
                  <input
                    name="price"
                    type="number"
                    placeholder="Prix"
                    value={form.price}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Catégorie
                  </label>
                  <input
                    name="category"
                    placeholder="Catégorie"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-gray-200 dark:border-gray-800 pt-4">
              <Button
                type="submit"
                disabled={isImproving}
                className="w-full bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] hover:opacity-90 transition-opacity"
              >
                {isImproving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Amélioration en cours...
                  </>
                ) : (
                  "Créer la demande"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </section>

      {/* Popup de comparaison */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Amélioration de votre description
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
                  Description originale:
                </h3>
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 h-32 overflow-y-auto">
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    {form.description}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-[#0ea5e9]">
                  Description améliorée par l'IA:
                </h3>
                <div className="p-3 bg-[#0ea5e9]/5 dark:bg-[#0ea5e9]/10 rounded border border-[#0ea5e9]/20 h-32 overflow-y-auto">
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    {improvedDescription}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4 mt-6">
              <Button
                onClick={() => createOfferWithDescription(false)}
                variant="outline"
                className="border-gray-300 dark:border-gray-700"
              >
                Garder l'originale
              </Button>
              <Button
                onClick={() => createOfferWithDescription(true)}
                className="bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] hover:opacity-90 transition-opacity"
              >
                Utiliser l'amélioration
              </Button>
            </div>

            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
