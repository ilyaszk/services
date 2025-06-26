"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Mail, CheckCircle, Clock, XCircle } from "lucide-react";
import { useSession } from "next-auth/react";

interface ContractStep {
    id: string;
    name: string;
    description: string;
    price: number;
    duration: string;
    isRealOffer: boolean;
    status: string;
    offer?: {
        id: string;
        title: string;
        author?: {
            id: string;
            name: string | null;
            email: string | null;
        };
    };
    provider?: {
        id: string;
        name: string | null;
        email: string | null;
    };
}

interface Contract {
    id: string;
    title: string;
    description: string;
    totalPrice: number;
    estimatedDuration: string;
    status: string;
    createdAt: string;
    contractSteps: ContractStep[];
    client: {
        id: string;
        name: string | null;
        email: string | null;
    };
}

export default function ContractDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [contract, setContract] = useState<Contract | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingStep, setUpdatingStep] = useState<string | null>(null);

    useEffect(() => {
        if (params?.id) {
            fetchContract(params.id as string);
        }
    }, [params?.id]);

    const fetchContract = async (contractId: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/contracts/${contractId}`);

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Contrat non trouvé');
                }
                throw new Error('Erreur lors de la récupération du contrat');
            }

            const data = await response.json();
            setContract(data);
        } catch (err: any) {
            setError(err.message || 'Erreur lors du chargement du contrat');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(price);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'accepted':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'completed':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'in_progress':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending':
                return 'En attente';
            case 'accepted':
                return 'Accepté';
            case 'rejected':
                return 'Rejeté';
            case 'completed':
                return 'Terminé';
            case 'in_progress':
                return 'En cours';
            default:
                return status;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-4 h-4" />;
            case 'in_progress':
                return <Clock className="w-4 h-4" />;
            case 'rejected':
                return <XCircle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const getUserRoleInContract = (contract: Contract) => {
        const isClient = contract.client.id === session?.user?.id;
        const isProvider = contract.steps.some(step => step.provider?.id === session?.user?.id);

        if (isClient) return 'client';
        if (isProvider) return 'provider';
        return 'unknown';
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'client':
                return { label: 'Client', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' };
            case 'provider':
                return { label: 'Prestataire', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
            default:
                return { label: 'Inconnu', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' };
        }
    };

    const updateStepStatus = async (stepId: string, newStatus: string) => {
        if (!params?.id) return;

        setUpdatingStep(stepId);
        try {
            const response = await fetch(`/api/contracts/${params.id}/steps/${stepId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour du statut');
            }

            // Recharger le contrat
            if (params?.id) {
                fetchContract(params.id as string);
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
            setError('Erreur lors de la mise à jour du statut');
        } finally {
            setUpdatingStep(null);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement du contrat...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Button
                    onClick={() => router.back()}
                    variant="outline"
                    className="mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                </Button>
                <div className="text-center text-red-600 dark:text-red-400">
                    <p>{error}</p>
                    <Button
                        onClick={() => params?.id && fetchContract(params.id as string)}
                        className="mt-4"
                    >
                        Réessayer
                    </Button>
                </div>
            </div>
        );
    }

    if (!contract) {
        return (
            <div className="container mx-auto px-4 py-8">
                <p>Contrat non trouvé</p>
            </div>
        );
    }

    const realOffersCount = contract.contractSteps.filter(step => step.isRealOffer).length;
    const userRole = getUserRoleInContract(contract);
    const roleInfo = getRoleLabel(userRole);

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Button
                onClick={() => router.back()}
                variant="outline"
                className="mb-6"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux contrats
            </Button>

            {/* En-tête du contrat */}
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {contract.title}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                {contract.description}
                            </p>
                            {userRole === 'provider' && (
                                <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                                    <span className="font-medium">Client: </span>
                                    {contract.client.name || contract.client.email}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <Badge className={getStatusColor(contract.status)}>
                                {getStatusText(contract.status)}
                            </Badge>
                            <Badge className={roleInfo.color}>
                                {roleInfo.label}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Prix total</p>
                            <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                                {formatPrice(contract.totalPrice)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Durée estimée</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {contract.estimatedDuration}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Étapes totales</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                {contract.contractSteps.length}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Offres réelles</p>
                            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                {realOffersCount}
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Créé le {new Date(contract.createdAt).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Étapes du contrat */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Étapes du contrat
                </h2>

                {contract.contractSteps.map((step, index) => (
                    <Card key={step.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center mb-3">
                                        <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-[#8b5cf6] to-[#0ea5e9] text-white rounded-full text-sm font-semibold mr-3">
                                            {index + 1}
                                        </span>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {step.name}
                                        </h3>
                                        <div className="ml-auto flex items-center gap-2">
                                            <Badge className={getStatusColor(step.status)}>
                                                {getStatusIcon(step.status)}
                                                <span className="ml-1">{getStatusText(step.status)}</span>
                                            </Badge>
                                            {step.isRealOffer && (
                                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                    Offre réelle
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-gray-600 dark:text-gray-400 mb-4 ml-11">
                                        {step.description}
                                    </p>

                                    <div className="flex items-center gap-6 ml-11 text-sm text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center">
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {formatPrice(step.price)}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <Clock className="w-4 h-4 mr-1" />
                                            <span>{step.duration}</span>
                                        </div>
                                    </div>

                                    {/* Informations sur le prestataire */}
                                    {step.isRealOffer && (step.provider || step.offer?.author) && (
                                        <div className="mt-4 ml-11 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                Prestataire
                                            </h4>
                                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                <User className="w-4 h-4 mr-2" />
                                                <span>{step.provider?.name || step.offer?.author?.name || "Non spécifié"}</span>
                                                {(step.provider?.email || step.offer?.author?.email) && (
                                                    <>
                                                        <Mail className="w-4 h-4 ml-4 mr-1" />
                                                        <span>{step.provider?.email || step.offer?.author?.email}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions pour les prestataires et clients */}
                                    {step.isRealOffer && (
                                        <div className="mt-4 ml-11">
                                            {userRole === 'provider' && step.provider?.id === session?.user?.id && (
                                                <div className="flex gap-2 flex-wrap">
                                                    {step.status === 'PENDING' && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => updateStepStatus(step.id, 'ACCEPTED')}
                                                                disabled={updatingStep === step.id}
                                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                            >
                                                                {updatingStep === step.id ? 'Mise à jour...' : 'Accepter'}
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => updateStepStatus(step.id, 'REJECTED')}
                                                                disabled={updatingStep === step.id}
                                                                className="border-red-300 text-red-600 hover:bg-red-50"
                                                            >
                                                                {updatingStep === step.id ? 'Mise à jour...' : 'Refuser'}
                                                            </Button>
                                                        </>
                                                    )}
                                                    {step.status === 'ACCEPTED' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => updateStepStatus(step.id, 'COMPLETED')}
                                                            disabled={updatingStep === step.id}
                                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                                        >
                                                            {updatingStep === step.id ? 'Mise à jour...' : 'Marquer comme terminé'}
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                            {userRole === 'client' && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {step.status === 'PENDING' && 'En attente de réponse du prestataire'}
                                                    {step.status === 'ACCEPTED' && 'Accepté par le prestataire - En cours de réalisation'}
                                                    {step.status === 'COMPLETED' && 'Terminé par le prestataire'}
                                                    {step.status === 'REJECTED' && 'Refusé par le prestataire'}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Actions */}
            <div className="mt-8 flex justify-center">
                <Button
                    onClick={() => router.push('/contrats')}
                    className="bg-gradient-to-r from-[#8b5cf6] to-[#0ea5e9] hover:opacity-90"
                >
                    Retour à mes contrats
                </Button>
            </div>
        </div>
    );
}
