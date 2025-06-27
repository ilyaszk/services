'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Pencil, XCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Offer {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  author?: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
}

interface OfferCardProps {
  offer: Offer;
  onDelete: (id: string) => void;
}

export default function OfferCard({ offer, onDelete }: OfferCardProps) {
  const { data: session } = useSession();

  return (
    <Card className="relative border border-gray-200 dark:border-gray-800 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-lg hover:shadow-[#0ea5e9]/5 dark:hover:shadow-[#0ea5e9]/10 flex flex-col">
      {session?.user?.role === 'Admin' && (
        <>
          <button
            title="Modifier"
            className="absolute top-2 left-2 z-10 bg-white/80 dark:bg-black/80 rounded-full p-1 hover:bg-blue-100 dark:hover:bg-blue-900"
            onClick={() => (window.location.href = `/offres/${offer.id}/edit`)}
          >
            <Pencil className="w-5 h-5 text-blue-600" />
          </button>
          <button
            title="Supprimer"
            className="absolute top-2 right-2 z-10 bg-white/80 dark:bg-black/80 rounded-full p-1 hover:bg-red-100 dark:hover:bg-red-900"
            onClick={() => onDelete(offer.id)}
          >
            <XCircle className="w-5 h-5 text-red-600" />
          </button>
        </>
      )}
      <CardContent className="p-6 flex-grow">
        <div className="flex items-center justify-between mb-4">
          <Badge
            variant="outline"
            className="bg-[#0ea5e9]/5 text-[#0ea5e9] border-[#0ea5e9]/20 dark:bg-[#0ea5e9]/10 dark:border-[#0ea5e9]/20"
          >
            {offer.category}
          </Badge>
          <span className="text-gray-900 dark:text-white font-bold">{offer.price} €</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{offer.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{offer.description}</p>
        {offer.author && (
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
            Proposé par: {offer.author.name || offer.author.email}
          </p>
        )}
      </CardContent>
      <CardFooter className="border-t border-gray-200 dark:border-gray-800 p-4 mt-auto">
        <Link href={`/offres/${offer.id}`} className="w-full">
          <Button
            variant="outline"
            className="w-full border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white"
          >
            Voir les détails
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
