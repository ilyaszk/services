"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
    LayoutDashboard,
    Bell, 
    FolderOpen,
    TrendingUp,
    Calendar,
    DollarSign,
    Clock,
    AlertTriangle,
    CheckCircle2,
    ArrowRight,
    Plus
} from "lucide-react";

interface DashboardStats {
    totalNotifications: number;
    totalProjects: number;
    urgentProjects: number;
    totalEarnings: number;
}

interface RecentNotification {
    id: string;
    name: string;
    contract: {
        title: string;
        client: {
            name: string | null;
        };
    };
    price: number;
    createdAt: string;
}

interface RecentProject {
    id: string;
    name: string;
    contract: {
        title: string;
        client: {
            name: string | null;
        };
    };
    deadline: string;
    price: number;
}

export default function ProviderDashboardPage() {
    const [stats, setStats] = useState<DashboardStats>({
        totalNotifications: 0,
        totalProjects: 0,
        urgentProjects: 0,
        totalEarnings: 0
    });
    const [recentNotifications, setRecentNotifications] = useState<RecentNotification[]>([]);
    const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    const { data: session, status } = useSession();
    const router = useRouter();

    // Rediriger si non connecté
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        }
    }, [status, router]);

    // Charger les données du dashboard
    useEffect(() => {
        if (session?.user?.id) {
            loadDashboardData();
        }
    }, [session]);

    async function loadDashboardData() {
        try {
            setLoading(true);
            
            // Charger les notifications
            const notificationsResponse = await fetch("/api/provider/notifications");
            const notifications = notificationsResponse.ok ? await notificationsResponse.json() : [];
            
            // Charger les projets
            const projectsResponse = await fetch("/api/provider/projects");
            const projects = projectsResponse.ok ? await projectsResponse.json() : [];

            // Calculer les statistiques
            const urgentProjects = projects.filter((p: any) => {
                const daysLeft = Math.ceil((new Date(p.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                return daysLeft <= 7;
            });

            const totalEarnings = projects.reduce((sum: number, p: any) => sum + p.price, 0);

            setStats({
                totalNotifications: notifications.length,
                totalProjects: projects.length,
                urgentProjects: urgentProjects.length,
                totalEarnings
            });

            // Prendre les 5 dernières notifications
            setRecentNotifications(notifications.slice(0, 5));
            
            // Prendre les 5 projets les plus urgents
            const sortedProjects = projects.sort((a: any, b: any) => 
                new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
            );
            setRecentProjects(sortedProjects.slice(0, 5));

        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur lors du chargement");
        } finally {
            setLoading(false);
        }
    }

    function formatPrice(price: number): string {
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "EUR"
        }).format(price);
    }

    function formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString("fr-FR", {
            day: 'numeric',
            month: 'short'
        });
    }

    function getDaysUntilDeadline(deadline: string): number {
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Chargement du dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center text-red-600">
                    <LayoutDashboard className="w-12 h-12 mx-auto mb-4" />
                    <p>{error}</p>
                    <Button onClick={loadDashboardData} className="mt-4">
                        Réessayer
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-12 mt-24">
            {/* En-tête */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <LayoutDashboard className="w-8 h-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Dashboard Prestataire
                    </h1>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                    Bienvenue {session?.user?.name}, voici un aperçu de votre activité.
                </p>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                    {stats.totalNotifications}
                                </div>
                                <div className="text-sm text-blue-600 dark:text-blue-400">
                                    Nouvelles notifications
                                </div>
                            </div>
                            <Bell className="w-8 h-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                                    {stats.totalProjects}
                                </div>
                                <div className="text-sm text-green-600 dark:text-green-400">
                                    Projets actifs
                                </div>
                            </div>
                            <FolderOpen className="w-8 h-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                                    {stats.urgentProjects}
                                </div>
                                <div className="text-sm text-orange-600 dark:text-orange-400">
                                    Échéances urgentes
                                </div>
                            </div>
                            <AlertTriangle className="w-8 h-8 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                                    {formatPrice(stats.totalEarnings)}
                                </div>
                                <div className="text-sm text-purple-600 dark:text-purple-400">
                                    Revenus totaux
                                </div>
                            </div>
                            <TrendingUp className="w-8 h-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Nouvelles notifications */}
                <Card>
                    <CardHeader className="border-b">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Bell className="w-5 h-5 text-blue-600" />
                                <h3 className="text-lg font-semibold">Nouvelles notifications</h3>
                            </div>
                            <Link href="/provider/notifications">
                                <Button variant="outline" size="sm">
                                    Voir tout
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        {recentNotifications.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>Aucune nouvelle notification</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentNotifications.map((notification) => (
                                    <div key={notification.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div>
                                            <h4 className="font-medium text-sm">{notification.name}</h4>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                {notification.contract.client.name} • {formatPrice(notification.price)}
                                            </p>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {formatDate(notification.createdAt)}
                                        </div>
                                    </div>
                                ))}
                                {recentNotifications.length === 5 && (
                                    <Link href="/provider/notifications">
                                        <Button variant="outline" className="w-full">
                                            Voir toutes les notifications
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Projets urgents */}
                <Card>
                    <CardHeader className="border-b">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-orange-600" />
                                <h3 className="text-lg font-semibold">Échéances proches</h3>
                            </div>
                            <Link href="/provider/projects">
                                <Button variant="outline" size="sm">
                                    Voir tout
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        {recentProjects.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>Aucun projet en cours</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentProjects.map((project) => {
                                    const daysLeft = getDaysUntilDeadline(project.deadline);
                                    return (
                                        <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div>
                                                <h4 className="font-medium text-sm">{project.name}</h4>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    {project.contract.client.name} • {formatPrice(project.price)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <Badge 
                                                    className={`text-xs ${
                                                        daysLeft < 0 ? 'bg-red-100 text-red-700' :
                                                        daysLeft <= 3 ? 'bg-orange-100 text-orange-700' :
                                                        daysLeft <= 7 ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-green-100 text-green-700'
                                                    }`}
                                                >
                                                    {daysLeft < 0 ? 'En retard' : `${daysLeft}j`}
                                                </Badge>
                                            </div>
                                        </div>
                                    );
                                })}
                                {recentProjects.length === 5 && (
                                    <Link href="/provider/projects">
                                        <Button variant="outline" className="w-full">
                                            Voir tous les projets
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Actions rapides */}
            <Card className="mt-8">
                <CardHeader>
                    <h3 className="text-lg font-semibold">Actions rapides</h3>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link href="/provider/notifications">
                            <Button className="w-full justify-start" variant="outline">
                                <Bell className="w-4 h-4 mr-2" />
                                Gérer les notifications
                            </Button>
                        </Link>
                        <Link href="/provider/projects">
                            <Button className="w-full justify-start" variant="outline">
                                <FolderOpen className="w-4 h-4 mr-2" />
                                Voir mes projets
                            </Button>
                        </Link>
                        <Link href="/offres/new">
                            <Button className="w-full justify-start" variant="outline">
                                <Plus className="w-4 h-4 mr-2" />
                                Créer une offre
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
