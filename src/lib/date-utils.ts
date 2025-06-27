/**
 * Utilitaires pour le formatage des dates
 * Évite les problèmes d'hydratation SSR/Client
 */

/**
 * Formate une date de manière cohérente entre serveur et client
 */
export function formatDate(date: string | Date, options: {
  includeTime?: boolean;
  short?: boolean;
} = {}): string {
  const { includeTime = false, short = false } = options;

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Vérifier que la date est valide
  if (isNaN(dateObj.getTime())) {
    return 'Date invalide';
  }

  if (short) {
    // Format court: 26/06/2025
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();

    if (includeTime) {
      const hours = dateObj.getHours().toString().padStart(2, '0');
      const minutes = dateObj.getMinutes().toString().padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    }

    return `${day}/${month}/${year}`;
  }

  // Format long: 26 juin 2025
  const months = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];

  const day = dateObj.getDate();
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();

  if (includeTime) {
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    return `${day} ${month} ${year} à ${hours}:${minutes}`;
  }

  return `${day} ${month} ${year}`;
}

/**
 * Formate une date de signature pour l'affichage
 */
export function formatSignatureDate(date: string | Date): string {
  return formatDate(date, { includeTime: true, short: true });
}

/**
 * Formate une date de création pour l'affichage
 */
export function formatCreationDate(date: string | Date): string {
  return formatDate(date, { includeTime: true, short: false });
}

/**
 * Calcule le temps relatif (il y a X temps)
 */
export function getRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffDays > 0) {
    return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  } else if (diffHours > 0) {
    return `il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  } else if (diffMinutes > 0) {
    return `il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
  } else {
    return 'à l\'instant';
  }
}
