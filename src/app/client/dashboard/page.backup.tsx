"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
    LayoutDashboard,
    Calendar,
    DollarSign,
    Clock,
    AlertTriangle,
    CheckCircle2,
    ArrowRight,
    FileText,
    User,
    Loader2
} from "lucide-react";
import { RoleGuard } from "@/components/role-guard";

interface DashboardStats {
    totalContracts: number;
    activeContracts: number;
    completedContracts: number;
    totalSpent: number;
}

interface ActiveContract {
    id: string;
    title: string;
    description: string;
    totalPrice: number;
    status: string;
    estimatedDuration: string;
    createdAt: string;
    contractSteps: {
        id: string;
        name: string;
        status: string;
        deadline?: string;
        provider?: {
            name: string | null;
        };
    }[];
}

// Main page component - this is what Next.js expects as the default export
export default function ClientDashboardPage() {
    return (
        <RoleGuard allowedRoles={["client"]} fallbackPath="/demo-roles">
            <ClientDashboardContent />
        </RoleGuard>
    );
}

function ClientDashboardContent() {
    const [stats, setStats] = useState<DashboardStats>({
        totalContracts: 0,
        activeContracts: 0,
        completedContracts: 0,
        totalSpent: 0,
    });
    const [activeContracts, setActiveContracts] = useState<ActiveContract[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { data: session } = useSession();

    useEffect(() => {
        if (session?.user?.id) {
            fetchDashboardData();
        }
    }, [session?.user?.id]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Charger les statistiques
            const statsResponse = await fetch("/api/client/dashboard/stats");
            if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                setStats(statsData);
            }

            // Charger les contrats actifs
            const contractsResponse = await fetch("/api/client/dashboard/active-contracts");
            if (contractsResponse.ok) {
                const contractsData = await contractsResponse.json();
                setActiveContracts(contractsData);
            }
        } catch (error) {
            console.error("Erreur lors du chargement du dashboard:", error);
            setError("Erreur lors du chargement des données");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
                return <Badge variant="outline" className="text-yellow-600 border-yellow-600">En attente</Badge>;
            case "IN_PROGRESS":
                return <Badge variant="outline" className="text-blue-600 border-blue-600">En cours</Badge>;
            case "COMPLETED":
                return <Badge variant="outline" className="text-green-600 border-green-600">Terminé</Badge>;
            case "CANCELLED":
                return <Badge variant="outline" className="text-red-600 border-red-600">Annulé</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 mt-12">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                        <p className="text-gray-600 dark:text-gray-400">Chargement de votre dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 mt-12">
                <Card>
                    <CardContent className="p-8 text-center">
                        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Erreur de chargement
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                        <Button onClick={fetchDashboardData}>Réessayer</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 mt-12">
            {/* En-tête */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Tableau de bord Client
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Suivez vos contrats acceptés et leur progression
                </p>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Total Contrats
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.totalContracts}
                                </p>
                            </div>
                            <FileText className="w-8 h-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Contrats Actifs
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.activeContracts}
                                </p>
                            </div>
                            <Clock className="w-8 h-8 text-yellow-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Contrats Terminés
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.completedContracts}
                                </p>
                            </div>
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Total Dépensé
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats.totalSpent.toFixed(2)}€
                                </p>
                            </div>
                            <DollarSign className="w-8 h-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Section Contrats actifs */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        Contrats en cours
                    </h2>
                    <Link href="/contrats">
                        <Button variant="outline" className="flex items-center gap-2">
                            Voir tous les contrats
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>

                {activeContracts.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Aucun contrat actif
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Vous n'avez pas encore de contrats en cours.
                            </p>
                            <Link href="/offres/new">
                                <Button>Poster une nouvelle offre</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6">
                        {activeContracts.map((contract) => (
                            <Card key={contract.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                                {contract.title}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                                                {contract.description}
                                            </p>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <DollarSign className="w-4 h-4" />
                                                    {contract.totalPrice.toFixed(2)}€
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {contract.estimatedDuration}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(contract.createdAt).toLocaleDateString('fr-FR')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            {getStatusBadge(contract.status)}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {contract.contractSteps && contract.contractSteps.length > 0 && (
                                        <div className="mb-4">
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                                Étapes du contrat ({contract.contractSteps.length}) :
                                            </h4>
                                            <div className="space-y-2">
                                                {contract.contractSteps.slice(0, 3).map((step) => (
                                                    <div key={step.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                {step.name}
                                                            </span>
                                                            {step.provider && (
                                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                                    <User className="w-3 h-3" />
                                                                    {step.provider.name}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {getStatusBadge(step.status)}
                                                            {step.deadline && (
                                                                <span className="text-xs text-gray-500">
                                                                    {new Date(step.deadline).toLocaleDateString('fr-FR')}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                                {contract.contractSteps.length > 3 && (
                                                    <p className="text-xs text-gray-500 text-center py-2">
                                                        +{contract.contractSteps.length - 3} étapes supplémentaires
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    <div className="mt-4 flex justify-end">
                                        <Link href={`/contrats/${contract.id}`}>
                                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                                                Voir le détail
                                                <ArrowRight className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Résumé financier */}
            <div className="flex justify-center">
                <div className="w-full md:w-1/2">
                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Résumé financier
                            </h3>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Total dépensé :</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                        {stats.totalSpent.toFixed(2)}€
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Contrats terminés :</span>
                                    <span className="font-semibold text-green-600">
                                        {stats.completedContracts}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">En cours :</span>
                                    <span className="font-semibold text-blue-600">
                                        {stats.activeContracts}
                                    </span>
                                </div>
                                <div className="pt-2 mt-3 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Moyenne par contrat :
                                        </span>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {stats.totalContracts > 0 
                                                ? (stats.totalSpent / stats.totalContracts).toFixed(2)
                                                : '0.00'
                                            }€
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
