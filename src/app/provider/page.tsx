"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useRole } from "@/components/role-toggle";

export default function ProviderPage() {
    const { data: session, status } = useSession();
    const { currentRole } = useRole();
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return; // Attendre le chargement de la session
        
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        } else if (session?.user) {
            // Rediriger vers le dashboard provider si connecté
            router.push("/provider/dashboard");
        } else {
            router.push("/");
        }
    }, [status, session, router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>Redirection...</p>
            </div>
        </div>
    );
}
