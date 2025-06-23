"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { improveAd } from "@/app/components/AdEditor";

export default function NewOfferPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        title: "",
        description: "",
        price: "",
        category: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Améliorer la description AVANT d'envoyer la requête
            const improvedDescription = await improveAd(form.description);

            const response = await fetch("/api/offers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    price: parseFloat(form.price),
                    description: improvedDescription, // description améliorée
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
        }
      };

    return (
        <div className= "container mx-auto px-6 py-12" >
        <h1 className="text-3xl font-bold mb-6" > Créer une nouvelle demande </h1>
            < form onSubmit = { handleSubmit } className = "space-y-4" >
                <input
          name="title"
    placeholder = "Titre"
    value = { form.title }
    onChange = { handleChange }
    className = "w-full p-2 border rounded"
    required
        />
        <textarea
          name="description"
    placeholder = "Description"
    value = { form.description }
    onChange = { handleChange }
    className = "w-full p-2 border rounded"
    required
        />
        <input
          name="price"
    type = "number"
    placeholder = "Prix"
    value = { form.price }
    onChange = { handleChange }
    className = "w-full p-2 border rounded"
    required
        />
        <input
          name="category"
    placeholder = "Catégorie"
    value = { form.category }
    onChange = { handleChange }
    className = "w-full p-2 border rounded"
    required
        />
        <button type="submit" className = "bg-blue-600 text-white px-4 py-2 rounded" >
            Créer
            </button>
            </form>
            </div>
  );
}
