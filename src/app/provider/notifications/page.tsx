"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    Bell, 
    User, 
    Mail, 
    Calendar, 
    DollarSign, 
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle
} from "lucide-react";

interface ContractNotification {
    id: string;
    name: string;
    description: string;
    price: number;
    duration: string;
    status: string;
    createdAt: string;
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

export default function ProviderNotificationsPage() {
    const [notifications, setNotifications] = useState<ContractNotification[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [deadlineInputs, setDeadlineInputs] = useState<{[key: string]: string}>({});
    const [rejectionReasons, setRejectionReasons] = useState<{[key: string]: string}>({});
    
    const { data: session, status } = useSession();
    const router = useRouter();

    // Rediriger si non connecté
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        }
    }, [status, router]);

    // Charger les notifications
    useEffect(() => {
        if (session?.user?.id) {
            fetchNotifications();
        }
    }, [session]);

    async function fetchNotifications() {
        try {
            const response = await fetch("/api/provider/notifications");
            if (!response.ok) {
                throw new Error("Erreur lors du chargement des notifications");
            }
            const data = await response.json();
            setNotifications(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur inconnue");
        } finally {
            setLoading(false);
        }
    }

    async function handleAcceptContract(contractId: string) {
        const deadline = deadlineInputs[contractId];
        if (!deadline) {
            alert("Veuillez sélectionner une date limite");
            return;
        }

        setActionLoading(contractId);
        try {
            const response = await fetch(`/api/provider/contracts/${contractId}/accept`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ deadline })
            });

            if (!response.ok) {
                throw new Error("Erreur lors de l'acceptation du contrat");
            }

            // Rafraîchir les notifications
            await fetchNotifications();
            
            // Nettoyer l'input
            setDeadlineInputs(prev => {
                const newInputs = { ...prev };
                delete newInputs[contractId];
                return newInputs;
            });

            alert("Contrat accepté avec succès !");
        } catch (err) {
            alert(err instanceof Error ? err.message : "Erreur lors de l'acceptation");
        } finally {
            setActionLoading(null);
        }
    }

    async function handleRejectContract(contractId: string) {
        const reason = rejectionReasons[contractId] || "";
        
        setActionLoading(contractId);
        try {
            const response = await fetch(`/api/provider/contracts/${contractId}/reject`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ reason })
            });

            if (!response.ok) {
                throw new Error("Erreur lors du refus du contrat");
            }

            // Rafraîchir les notifications
            await fetchNotifications();
            
            // Nettoyer l'input
            setRejectionReasons(prev => {
                const newReasons = { ...prev };
                delete newReasons[contractId];
                return newReasons;
            });

            alert("Contrat refusé");
        } catch (err) {
            alert(err instanceof Error ? err.message : "Erreur lors du refus");
        } finally {
            setActionLoading(null);
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
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Chargement des notifications...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center text-red-600">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                    <p>{error}</p>
                    <Button onClick={fetchNotifications} className="mt-4">
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
                    <Bell className="w-8 h-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Notifications de contrats
                    </h1>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                    Voici les nouvelles demandes de contrats qui nécessitent votre attention.
                </p>
            </div>

            {notifications.length === 0 ? (
                <Card className="text-center py-12">
                    <CardContent>
                        <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Aucune notification
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Vous n'avez aucun contrat en attente pour le moment.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {notifications.map((notification) => (
                        <Card key={notification.id} className="overflow-hidden border-l-4 border-l-blue-500">
                            <CardHeader className="bg-gray-50 dark:bg-gray-800/50">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {notification.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            Contrat: {notification.contract.title}
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                        En attente
                                    </Badge>
                                </div>
                            </CardHeader>
                            
                            <CardContent className="p-6 space-y-6">
                                {/* Informations sur le contrat */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-green-600" />
                                        <span className="font-medium">{formatPrice(notification.price)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-blue-600" />
                                        <span>{notification.duration}</span>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <h4 className="font-medium mb-2">Description:</h4>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                        {notification.description}
                                    </p>
                                </div>

                                {/* Informations client */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Informations client
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-gray-500" />
                                            <span>{notification.contract.client.name || "Non spécifié"}</span>
                                        </div>
                                        {notification.contract.client.email && (
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-gray-500" />
                                                <span>{notification.contract.client.email}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Date de demande */}
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Calendar className="w-4 h-4" />
                                    <span>Demandé le {formatDate(notification.createdAt)}</span>
                                </div>

                                {/* Actions */}
                                <div className="border-t pt-6">
                                    <div className="space-y-4">
                                        {/* Acceptation avec date limite */}
                                        <div className="space-y-3">
                                            <Label htmlFor={`deadline-${notification.id}`}>
                                                Date limite pour terminer le projet:
                                            </Label>
                                            <Input
                                                id={`deadline-${notification.id}`}
                                                type="datetime-local"
                                                value={deadlineInputs[notification.id] || ""}
                                                onChange={(e) => setDeadlineInputs(prev => ({
                                                    ...prev,
                                                    [notification.id]: e.target.value
                                                }))}
                                                className="max-w-md"
                                            />
                                        </div>

                                        {/* Refus avec raison */}
                                        <div className="space-y-3">
                                            <Label htmlFor={`reason-${notification.id}`}>
                                                Raison du refus (optionnel):
                                            </Label>
                                            <Input
                                                id={`reason-${notification.id}`}
                                                type="text"
                                                placeholder="Ex: Pas disponible, budget insuffisant..."
                                                value={rejectionReasons[notification.id] || ""}
                                                onChange={(e) => setRejectionReasons(prev => ({
                                                    ...prev,
                                                    [notification.id]: e.target.value
                                                }))}
                                                className="max-w-md"
                                            />
                                        </div>

                                        {/* Boutons d'action */}
                                        <div className="flex gap-3">
                                            <Button
                                                onClick={() => handleAcceptContract(notification.id)}
                                                disabled={actionLoading === notification.id || !deadlineInputs[notification.id]}
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                            >
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                {actionLoading === notification.id ? "Acceptation..." : "Accepter"}
                                            </Button>
                                            
                                            <Button
                                                variant="outline"
                                                onClick={() => handleRejectContract(notification.id)}
                                                disabled={actionLoading === notification.id}
                                                className="border-red-300 text-red-600 hover:bg-red-50"
                                            >
                                                <XCircle className="w-4 h-4 mr-2" />
                                                {actionLoading === notification.id ? "Refus..." : "Refuser"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
