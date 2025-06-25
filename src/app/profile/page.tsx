'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, Building, Pencil, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return null;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-black">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Accès refusé</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Vous devez être connecté pour accéder à votre profil.
          </p>
          <Link href="/api/auth/signin">
            <Button className="bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] hover:opacity-90 text-white px-8 py-3 rounded-lg font-medium transition-opacity">
              Se connecter
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const user = session?.user;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-gray-900 dark:text-white">
      <div className="relative py-20 md:py-32">
        <div className="absolute inset-0 overflow-hidden z-0">
          <div className="absolute -top-[20%] -left-[15%] w-[50%] h-[80%] rounded-full bg-[#1e40af]/10 dark:bg-[#1e40af]/20 blur-[120px]"></div>
          <div className="absolute top-[10%] -right-[15%] w-[50%] h-[70%] rounded-full bg-[#8b5cf6]/10 dark:bg-[#8b5cf6]/20 blur-[120px]"></div>
        </div>

        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-gradient-to-b from-gray-100/80 to-white/80 dark:from-gray-900/80 dark:to-black/80 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-white dark:border-gray-800 shadow-lg">
                    <AvatarImage src={user?.image || ''} alt={user?.name || ''} />
                    <AvatarFallback className="text-4xl bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] text-white">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-between">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                        {user?.name}
                      </h1>
                      <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">{user?.email}</p>
                    </div>
                    <Link href={`/profile/edit`} className="hidden md:block">
                      <Button variant="outline" size="sm" className="bg-transparent">
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier le profil
                      </Button>
                    </Link>
                  </div>
                  {user?.role && (
                    <Badge className="mt-4 bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] text-white border-none">
                      {user.role}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-800 my-8"></div>

              <div>
                <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                  Informations
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-r from-[#0ea5e9] to-[#1e40af] w-12 h-12 rounded-lg flex items-center justify-center shrink-0">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Entreprise
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {user?.company || 'Non spécifié'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-gradient-to-r from-[#8b5cf6] to-[#1e40af] w-12 h-12 rounded-lg flex items-center justify-center shrink-0">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Poste</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {user?.jobTitle || 'Non spécifié'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex items-start gap-4">
                  <div className="bg-gradient-to-r from-[#f59e0b] to-[#10b981] w-12 h-12 rounded-lg flex items-center justify-center shrink-0">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Bio</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {user?.bio || 'Non spécifié'}
                    </p>
                  </div>
                </div>
              </div>
              <Link href={`/profile/edit`} className="md:hidden mt-8 w-full">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Pencil className="mr-2 h-4 w-4" />
                  Modifier le profil
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
