'use client';

import ContractNotifications from '@/components/contract-notifications';
import { ConversationLink } from '@/components/conversation-link';
import { ConversationLinkMobile } from '@/components/conversation-link-mobile';
import { RoleToggle, RoleToggleCompact, useRole } from '@/components/role-toggle';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { currentRole } = useRole();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    if (mounted) {
      handleScroll();
      window.addEventListener('scroll', handleScroll);
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [mounted]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 bg-white/80 dark:bg-black/80 backdrop-blur border-b border-gray-200 dark:border-gray-800 ${
        mounted && scrolled ? 'shadow-md' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] flex items-center justify-center">
                <span className="text-white font-bold">S</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-800 dark:text-white">SMP</span>{' '}
            </Link>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              <Link
                href="/offres"
                className="text-gray-800 dark:text-gray-300 hover:text-[#0ea5e9] dark:hover:text-white border-transparent hover:border-[#0ea5e9] inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
              >
                Offres
              </Link>
              <Link
                href="/demo-roles"
                className="text-gray-800 dark:text-gray-300 hover:text-[#0ea5e9] dark:hover:text-white border-transparent hover:border-[#0ea5e9] inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
              >
                Mon Espace
              </Link>

              {status === 'authenticated' && <ConversationLink />}
              {status === 'authenticated' && <ContractNotifications />}
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center gap-4">
            {/* Bouton de thème */}
            {mounted && (
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className="w-9 h-9 rounded-full bg-transparent border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                aria-label="Changer de thème"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            )}

            {status === 'authenticated' && session?.user ? (
              <div className="flex items-center">
                <span className="text-gray-700 dark:text-gray-300 mr-4">
                  Bonjour, {session.user.name || 'Utilisateur'}
                </span>
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-gray-400 transition duration-150 ease-in-out"
                  >
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt={`Avatar de ${session.user.name || "l'utilisateur"}`}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#1e40af] flex items-center justify-center text-white">
                        {session.user.name?.charAt(0).toUpperCase() ||
                          session.user.email?.charAt(0).toUpperCase() ||
                          'U'}
                      </div>
                    )}
                  </button>

                  {isMenuOpen && (
                    <div className="z-100 origin-top-right absolute right-0 mt-2 w-56 rounded-lg shadow-lg py-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 ring-1 ring-black ring-opacity-5">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800">
                        <p className="text-sm font-medium text-gray-800 dark:text-white">
                          {session.user.name || 'Utilisateur'}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {session.user.email}
                        </p>
                      </div>
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          Mode d'utilisation :
                        </div>
                        <RoleToggleCompact />
                      </div>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Profil
                      </Link>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          signOut({ redirect: true, callbackUrl: '/' });
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/signin"
                  className="text-gray-700 dark:text-gray-300 hover:text-[#0ea5e9] dark:hover:text-white transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center space-x-2">
            {/* Bouton de thème mobile */}
            {mounted && (
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className="w-8 h-8 rounded-full bg-transparent border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-400"
                aria-label="Changer de thème"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
            >
              <span className="sr-only">Ouvrir le menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white/95 dark:bg-black/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800">
          {/* Role Toggle for mobile */}
          {status === 'authenticated' && (
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
              <RoleToggle />
            </div>
          )}

          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/offres"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-[#0ea5e9]"
              onClick={() => setIsMenuOpen(false)}
            >
              Offres
            </Link>
            <Link
              href="/demo-roles"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-[#0ea5e9]"
              onClick={() => setIsMenuOpen(false)}
            >
              Mon Espace
            </Link>
            {status === 'authenticated' && currentRole === 'client' && <></>}
            {status === 'authenticated' && <></>}
            {status === 'authenticated' && currentRole === 'provider' && <></>}
            {status === 'authenticated' && (
              <ConversationLinkMobile onClose={() => setIsMenuOpen(false)} />
            )}
          </div>
          {status === 'authenticated' && session?.user ? (
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center px-4">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={`Avatar de ${session.user.name || "l'utilisateur"}`}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#1e40af] flex items-center justify-center text-white">
                    {session.user.name?.charAt(0).toUpperCase() ||
                      session.user.email?.charAt(0).toUpperCase() ||
                      'U'}
                  </div>
                )}
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800 dark:text-white">
                    {session.user.name || 'Utilisateur'}
                  </div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {session.user.email}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profil
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    signOut({ redirect: true, callbackUrl: '/' });
                  }}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-800">
              <div className="space-y-1">
                <Link
                  href="/auth/signin"
                  className="block px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/signup"
                  className="block px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Inscription
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
