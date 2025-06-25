'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '');
      setCompany(session.user.company || '');
      setJobTitle(session.user.jobTitle || '');
      setBio(session.user.bio || '');
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const response = await fetch(`/api/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, company, jobTitle, bio }),
    });

    if (response.ok) {
      const updatedUser = await response.json();
      await update({ user: updatedUser });
      setSuccess('Profil mis à jour avec succès !');
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    } else {
      const data = await response.json();
      setError(data.message || 'Une erreur est survenue.');
    }
  };

  if (status === 'loading') {
    return null;
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

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
              <div className="mb-8">
                <Link
                  href="/profile"
                  className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour au profil
                </Link>
                <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 mt-4">
                  Modifier le profil
                </h1>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {error && <p className="text-red-500 bg-red-500/10 p-3 rounded-lg">{error}</p>}
                {success && (
                  <p className="text-green-500 bg-green-500/10 p-3 rounded-lg">{success}</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-medium text-gray-700 dark:text-gray-300">
                      Nom
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                      className="bg-white/50 dark:bg-black/50 border-gray-300 dark:border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </Label>
                    <Input
                      disabled
                      id="email"
                      type="email"
                      value={session?.user?.email || ''}
                      readOnly
                      className="bg-gray-200/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="company"
                      className="font-medium text-gray-700 dark:text-gray-300"
                    >
                      Entreprise
                    </Label>
                    <Input
                      id="company"
                      value={company}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setCompany(e.target.value)
                      }
                      className="bg-white/50 dark:bg-black/50 border-gray-300 dark:border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="jobTitle"
                      className="font-medium text-gray-700 dark:text-gray-300"
                    >
                      Poste
                    </Label>
                    <Input
                      id="jobTitle"
                      value={jobTitle}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setJobTitle(e.target.value)
                      }
                      className="bg-white/50 dark:bg-black/50 border-gray-300 dark:border-gray-700"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio" className="font-medium text-gray-700 dark:text-gray-300">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
                    className="bg-white/50 dark:bg-black/50 border-gray-300 dark:border-gray-700 min-h-[120px]"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] hover:opacity-90 text-white px-8 py-3 rounded-lg font-medium transition-opacity"
                  >
                    Enregistrer
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
