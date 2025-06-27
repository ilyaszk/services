"use client";

import { useRole } from "@/components/role-toggle";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  Users, 
  UserCheck, 
  LayoutDashboard, 
  FileText, 
  Bell,
  FolderOpen,
  ArrowRight
} from "lucide-react";

export default function RoleDemoPage() {
  const { currentRole } = useRole();

  const clientFeatures = [
    {
      icon: <LayoutDashboard className="w-6 h-6" />,
      title: "Tableau de bord Client",
      description: "Suivez vos contrats acceptés, leur progression et les étapes en cours",
      link: "/client/dashboard"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Mes Contrats",
      description: "Gérez tous vos contrats et leurs étapes",
      link: "/contrats"
    }
  ];

  const providerFeatures = [
    {
      icon: <LayoutDashboard className="w-6 h-6" />,
      title: "Dashboard Prestataire",
      description: "Vue d'ensemble de vos projets et revenus",
      link: "/provider/dashboard"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Mes Offres",
      description: "Consultez et gérez vos offres postées",
      link: "/offres/mes-offres"
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Notifications",
      description: "Nouvelles opportunités et demandes de projets",
      link: "/provider/notifications"
    },
    {
      icon: <FolderOpen className="w-6 h-6" />,
      title: "Mes Projets",
      description: "Gérez vos projets en cours et terminés",
      link: "/provider/projects"
    }
  ];

  const currentFeatures = currentRole === "client" ? clientFeatures : providerFeatures;

  return (
    <div className="container mx-auto px-4 py-8 mt-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Mon Espace Personnel
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          Accédez à tous vos outils selon votre mode d'utilisation
        </p>
        
        <div className="flex items-center justify-center gap-4 mb-8">
          <Badge 
            variant={currentRole === "client" ? "default" : "outline"}
            className="flex items-center gap-2 px-4 py-2 text-lg"
          >
            <Users className="w-5 h-5" />
            Mode Client
          </Badge>
          <div className="text-gray-400">⟷</div>
          <Badge 
            variant={currentRole === "provider" ? "default" : "outline"}
            className="flex items-center gap-2 px-4 py-2 text-lg"
          >
            <UserCheck className="w-5 h-5" />
            Mode Prestataire
          </Badge>
        </div>
      </div>

      <div className="mb-12">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              {currentRole === "client" ? (
                <>
                  <Users className="w-8 h-8 text-blue-500" />
                  Mode Client Actif
                </>
              ) : (
                <>
                  <UserCheck className="w-8 h-8 text-purple-500" />
                  Mode Prestataire Actif
                </>
              )}
            </h2>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 text-lg">
              {currentRole === "client" ? (
                "Vous êtes en mode client. Vous pouvez poster des offres, suivre vos projets et gérer vos contrats."
              ) : (
                "Vous êtes en mode prestataire. Vous pouvez voir les notifications, gérer vos projets acceptés et suivre vos revenus."
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentFeatures.map((feature, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${
                  currentRole === "client" 
                    ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" 
                    : "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                }`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {feature.description}
              </p>
              <Link href={feature.link}>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentRole === "client"
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-purple-500 hover:bg-purple-600 text-white"
                }`}>
                  Accéder
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-16 space-y-8">
        {currentRole === "client" && (
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Suivi de vos contrats acceptés
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    Contrats en cours
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Visualisez tous vos contrats acceptés par les prestataires avec leur statut en temps réel.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    Progression par étapes
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Suivez chaque étape de vos projets : en attente, en cours, terminé. Chaque contrat est divisé en étapes claires.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    Statistiques détaillées
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Consultez vos dépenses totales, le nombre de contrats actifs et terminés dans votre tableau de bord.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Comment ça fonctionne ?
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                1
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  Un seul compte pour tout
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Plus besoin de créer plusieurs comptes. Votre compte unique s'adapte à vos besoins.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-sm">
                2
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  Commutateur de rôle intelligent
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Utilisez le commutateur en haut de page pour passer entre les modes client et prestataire.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-sm">
                3
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  Accès automatique aux fonctionnalités
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Dès que vous postez une offre, vous obtenez automatiquement accès au mode prestataire.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
