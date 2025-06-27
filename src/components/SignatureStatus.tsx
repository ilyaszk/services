import { CheckCircle, Clock, FileSignature, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatSignatureDate } from "@/lib/date-utils";

interface SignatureStatusProps {
  clientSignedAt?: string | null;
  providerSignedAt?: string | null;
  isClientView?: boolean;
  isProviderView?: boolean;
  showLabels?: boolean;
}

export function SignatureStatus({
  clientSignedAt,
  providerSignedAt,
  isClientView = false,
  isProviderView = false,
  showLabels = true,
}: SignatureStatusProps) {
  const getStatusBadge = () => {
    if (clientSignedAt && providerSignedAt) {
      return (
        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          {showLabels ? 'Entièrement signé' : 'Signé'}
        </Badge>
      );
    }

    if (clientSignedAt && !providerSignedAt) {
      return (
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          <Clock className="w-3 h-3 mr-1" />
          {showLabels ? 'En attente prestataire' : 'En attente'}
        </Badge>
      );
    }

    if (!clientSignedAt) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          <FileSignature className="w-3 h-3 mr-1" />
          {showLabels ? 'En attente client' : 'En attente'}
        </Badge>
      );
    }

    return null;
  };

  const getDetailedStatus = () => {
    const details = [];

    if (clientSignedAt) {
      details.push({
        type: 'client',
        signedAt: clientSignedAt,
        label: isProviderView ? 'Client' : 'Vous',
        icon: isProviderView ? User : CheckCircle,
      });
    }

    if (providerSignedAt) {
      details.push({
        type: 'provider',
        signedAt: providerSignedAt,
        label: isClientView ? 'Prestataire' : 'Vous',
        icon: isClientView ? User : CheckCircle,
      });
    }

    return details;
  };

  const statusBadge = getStatusBadge();
  const details = getDetailedStatus();

  return (
    <div className="space-y-2">
      {statusBadge}

      {details.length > 0 && (
        <div className="space-y-1">
          {details.map((detail, index) => {
            const IconComponent = detail.icon;
            return (
              <div key={index} className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                <IconComponent className="w-3 h-3 mr-2 text-green-600" />
                <span>
                  {detail.label} signé le {formatSignatureDate(detail.signedAt)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
