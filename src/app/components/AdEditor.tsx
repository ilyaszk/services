import { useState } from "react";

export async function improveAd(content: string): Promise<string> {
    const res = await fetch("/api/improve-ad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
    });

    if (!res.ok) {
        throw new Error("Erreur lors de l'amélioration de la description");
    }

    const data = await res.json();
    return data.improved;
  }