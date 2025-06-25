"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

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
    steps: ContractStep[];
}

export default function ContractsPage() {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { data: session } = useSession();

    useEffect(() => {
        if (session?.user) {
            fetchContracts();
        }
    }, [session]);

    const fetchContracts = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/contracts');

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des contrats');
            }

            const data = await response.json();
            setContracts(data);
        } catch (err) {
            setError('Erreur lors du chargement des contrats');
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
            default:
                return status;
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement des contrats...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center text-red-600 dark:text-red-400">
                    <p>{error}</p>
                    <button
                        onClick={fetchContracts}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Mes Contrats
                </h1>
                <Link
                    href="/offres"
                    className="px-4 py-2 bg-gradient-to-r from-[#8b5cf6] to-[#0ea5e9] text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                    Créer un nouveau contrat
                </Link>
            </div>

            {contracts.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-500 dark:text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg">Aucun contrat trouvé</p>
                        <p className="text-sm mt-2">Commencez par explorer les offres et créer votre premier chemin de services.</p>
                    </div>
                    <Link
                        href="/offres"
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#8b5cf6] to-[#0ea5e9] text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Créer mon premier contrat
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {contracts.map((contract) => (
                        <Card key={contract.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                                        {contract.title}
                                    </h3>
                                    <Badge className={getStatusColor(contract.status)}>
                                        {getStatusText(contract.status)}
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                    {contract.description}
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Prix total:</span>
                                        <span className="font-semibold text-green-600 dark:text-green-400">
                                            {formatPrice(contract.totalPrice)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Durée estimée:</span>
                                        <span className="text-sm text-gray-900 dark:text-white">
                                            {contract.estimatedDuration}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Étapes:</span>
                                        <span className="text-sm text-gray-900 dark:text-white">
                                            {contract.steps.length} étapes
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Créé le:</span>
                                        <span className="text-sm text-gray-900 dark:text-white">
                                            {new Date(contract.createdAt).toLocaleDateString('fr-FR')}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Étapes du contrat:
                                    </h4>
                                    <div className="space-y-2 max-h-32 overflow-y-auto">
                                        {contract.steps.map((step, index) => (
                                            <div key={step.id} className="flex justify-between items-center text-xs">
                                                <div className="flex items-center">
                                                    <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs mr-2">
                                                        {index + 1}
                                                    </span>
                                                    <span className="text-gray-600 dark:text-gray-400 truncate">
                                                        {step.name}
                                                    </span>
                                                    {step.isRealOffer && (
                                                        <Badge className="ml-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                            Réel
                                                        </Badge>
                                                    )}
                                                </div>
                                                <span className="text-gray-500 dark:text-gray-400 font-medium">
                                                    {formatPrice(step.price)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <Link
                                        href={`/contrats/${contract.id}`}
                                        className="w-full inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-[#8b5cf6] to-[#a855f7] text-white text-sm rounded-lg hover:opacity-90 transition-opacity"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        Voir les détails
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
