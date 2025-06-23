import { useState } from "react";

export default function AdEditor() {
    const [content, setContent] = useState("");
    const [improved, setImproved] = useState("");
    const [loading, setLoading] = useState(false);

    const handleImprove = async () => {
        setLoading(true);
        const res = await fetch("/api/improve-ad", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content }),
        });
        const data = await res.json();
        setImproved(data.improved);
        setLoading(false);
    };

    return (
        <div className= "space-y-4" >
        <textarea
        value={ content }
    onChange = {(e) => setContent(e.target.value)
}
rows = { 6}
className = "w-full border rounded p-2"
placeholder = "Écris ton annonce ici..."
    />

    <button
        onClick={ handleImprove }
disabled = { loading }
className = "bg-blue-500 text-white px-4 py-2 rounded"
    >
    { loading? "Amélioration en cours...": "Améliorer l’annonce" }
    </button>

{
    improved && (
        <div className="mt-4 border rounded p-4 bg-gray-100" >
            <h3 className="font-semibold mb-2" > Version améliorée: </h3>
                < p > { improved } </p>
                </div>
      )
}
</div>
  );
}
