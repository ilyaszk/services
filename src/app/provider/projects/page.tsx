"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    FolderOpen, 
    User, 
    Mail, 
    Calendar, 
    DollarSign, 
    Clock,
    AlertTriangle,
    CheckCircle2,
    Target
} from "lucide-react";

interface Project {
    id: string;
    name: string;
    description: string;
    price: number;
    duration: string;
    status: string;
    acceptedAt: string;
    startDate: string;
    deadline: string;
    contract: {
        id: string;
        title: string;
        description: string;
        totalPrice: number;
        client: {
            id: string;
            name: string | null;
            email: string | null;
        };
    };
    offer?: {
        id: string;
        title: string;
        description: string;
    };
}

export default function ProviderProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
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

    // Charger les projets
    useEffect(() => {
        if (session?.user?.id) {
            fetchProjects();
        }
    }, [session]);

    async function fetchProjects() {
        try {
            const response = await fetch("/api/provider/projects");
            if (!response.ok) {
                throw new Error("Erreur lors du chargement des projets");
            }
            const data = await response.json();
            setProjects(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur inconnue");
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
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function formatDateTime(dateString: string): string {
        return new Date(dateString).toLocaleDateString("fr-FR", {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function getDaysUntilDeadline(deadline: string): number {
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    function getDeadlineStatus(deadline: string): { status: string; color: string; icon: any } {
        const daysLeft = getDaysUntilDeadline(deadline);
        
        if (daysLeft < 0) {
            return { status: "En retard", color: "text-red-600 bg-red-50 border-red-200", icon: AlertTriangle };
        } else if (daysLeft <= 3) {
            return { status: "Urgent", color: "text-orange-600 bg-orange-50 border-orange-200", icon: AlertTriangle };
        } else if (daysLeft <= 7) {
            return { status: "Bientôt", color: "text-yellow-600 bg-yellow-50 border-yellow-200", icon: Clock };
        } else {
            return { status: "En cours", color: "text-green-600 bg-green-50 border-green-200", icon: CheckCircle2 };
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Chargement des projets...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center text-red-600">
                    <FolderOpen className="w-12 h-12 mx-auto mb-4" />
                    <p>{error}</p>
                    <Button onClick={fetchProjects} className="mt-4">
                        Réessayer
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-12 mt-24">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <FolderOpen className="w-8 h-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Mes projets en cours
                    </h1>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                    Gérez vos projets acceptés et suivez vos échéances.
                </p>
            </div>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{projects.length}</div>
                        <div className="text-sm text-gray-600">Projets actifs</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600">
                            {projects.filter(p => getDaysUntilDeadline(p.deadline) <= 7).length}
                        </div>
                        <div className="text-sm text-gray-600">Échéances proches</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">
                            {projects.filter(p => getDaysUntilDeadline(p.deadline) < 0).length}
                        </div>
                        <div className="text-sm text-gray-600">En retard</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {formatPrice(projects.reduce((sum, p) => sum + p.price, 0))}
                        </div>
                        <div className="text-sm text-gray-600">Revenus totaux</div>
                    </CardContent>
                </Card>
            </div>

            {projects.length === 0 ? (
                <Card className="text-center py-12">
                    <CardContent>
                        <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Aucun projet en cours
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Vous n'avez pas encore de projets acceptés.
                        </p>
                        <Button 
                            onClick={() => router.push("/provider/notifications")}
                            className="mt-4"
                        >
                            Voir les notifications
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {projects.map((project) => {
                        const deadlineStatus = getDeadlineStatus(project.deadline);
                        const daysLeft = getDaysUntilDeadline(project.deadline);
                        const IconComponent = deadlineStatus.icon;

                        return (
                            <Card key={project.id} className="overflow-hidden">
                                <CardHeader className="bg-gray-50 dark:bg-gray-800/50">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {project.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                Contrat: {project.contract.title}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge className={deadlineStatus.color}>
                                                <IconComponent className="w-3 h-3 mr-1" />
                                                {deadlineStatus.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                
                                <CardContent className="p-6 space-y-6">
                                    {/* Informations sur le projet */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-green-600" />
                                            <span className="font-medium">{formatPrice(project.price)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-blue-600" />
                                            <span>{project.duration}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Target className="w-4 h-4 text-purple-600" />
                                            <span>
                                                {daysLeft > 0 
                                                    ? `${daysLeft} jour${daysLeft > 1 ? 's' : ''} restant${daysLeft > 1 ? 's' : ''}`
                                                    : `En retard de ${Math.abs(daysLeft)} jour${Math.abs(daysLeft) > 1 ? 's' : ''}`
                                                }
                                            </span>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <h4 className="font-medium mb-2">Description:</h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                                            {project.description}
                                        </p>
                                    </div>

                                    {/* Informations client */}
                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                        <h4 className="font-medium mb-3 flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            Client
                                        </h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-500" />
                                                <span>{project.contract.client.name || "Non spécifié"}</span>
                                            </div>
                                            {project.contract.client.email && (
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-gray-500" />
                                                    <span>{project.contract.client.email}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Timeline du projet */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">Accepté le</div>
                                            <div className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(project.acceptedAt)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">Commencé le</div>
                                            <div className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(project.startDate)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                Date limite
                                            </div>
                                            <div className={`flex items-center gap-1 ${
                                                daysLeft < 0 ? 'text-red-600' : 
                                                daysLeft <= 3 ? 'text-orange-600' : 
                                                'text-gray-600 dark:text-gray-400'
                                            }`}>
                                                <Calendar className="w-3 h-3" />
                                                {formatDateTime(project.deadline)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="border-t pt-4">
                                        <div className="flex gap-3">
                                            <Button
                                                onClick={() => router.push(`/contrats/${project.contract.id}`)}
                                                variant="outline"
                                            >
                                                Voir le contrat
                                            </Button>
                                            {project.contract.client.email && (
                                                <Button
                                                    onClick={() => window.location.href = `mailto:${project.contract.client.email}`}
                                                    variant="outline"
                                                >
                                                    <Mail className="w-4 h-4 mr-2" />
                                                    Contacter le client
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
