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
}