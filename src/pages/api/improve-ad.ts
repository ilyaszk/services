import type { NextApiRequest, NextApiResponse } from "next";
// import { improveAd } from "./app/lib/gemini";
import { improveAd } from "@/app/lib/gemini";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

    const { content } = req.body;

    if (!content) return res.status(400).json({ error: "Missing content" });

    try {
        const improved = await improveAd(content);
        res.status(200).json({ improved });
    } catch (error) {
        res.status(500).json({ error: "AI failed to process the ad." });
    }
}
