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
    const [showPopup, setShowPopup] = useState(false);
    const [improvedDescription, setImprovedDescription] = useState("");
    const [isImproving, setIsImproving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsImproving(true);
            // Améliorer la description et afficher la popup
            const improved = await improveAd(form.description);
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
            const finalDescription = useImproved ? improvedDescription : form.description;

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
    rows = { 4}
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
        <button 
                    type="submit"
    className = "bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
    disabled = { isImproving }
        >
        { isImproving? "Amélioration en cours...": "Créer" }
        </button>
        </form>

    {/* Popup de comparaison */ }
    {
        showPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" >
                <div className="bg-white p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto" >
                    <h2 className="text-2xl font-bold mb-4 text-gray-800" > Amélioration de votre description </h2>

                        < div className = "grid md:grid-cols-2 gap-6" >
                            <div>
                            <h3 className="text-lg font-semibold mb-2 text-gray-800" > Description originale: </h3>
                                < div className = "p-3 bg-gray-100 rounded border h-32 overflow-y-auto" >
                                    <p className="text-sm text-gray-800" > { form.description } </p>
                                        </div>
                                        </div>

                                        < div >
                                        <h3 className="text-lg font-semibold mb-2 text-blue-700" > Description améliorée par l'IA :</h3>
                                            < div className = "p-3 bg-blue-50 rounded border h-32 overflow-y-auto" >
                                                <p className="text-sm text-gray-800" > { improvedDescription } </p>
                                                    </div>
                                                    </div>
                                                    </div>

                                                    < div className = "flex justify-center gap-4 mt-6" >
                                                        <button
                                onClick={ () => createOfferWithDescription(false) }
        className = "px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
            Garder l'originale
                </button>
                < button
        onClick = {() => createOfferWithDescription(true)
    }
    className = "px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
        Utiliser l'amélioration
            </button>
            </div>

            < button
    onClick = {() => setShowPopup(false)
}
className = "absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
    >
                            ×
</button>
    </div>
    </div>
            )}
</div>
    );
}