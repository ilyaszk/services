import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileSignature, CheckCircle, Clock } from "lucide-react";

interface SignatureActionsProps {
  contractId: string;
  stepId?: string;
  userRole: 'client' | 'provider';
  canSign: boolean;
  isFullContractSignature?: boolean;
  onSignatureComplete?: () => void;
  disabled?: boolean;
}

export function SignatureActions({
  contractId,
  stepId,
  userRole,
  canSign,
  isFullContractSignature = false,
  onSignatureComplete,
  disabled = false,
}: SignatureActionsProps) {
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSign = async () => {
    setIsSigning(true);
    setError(null);

    try {
      let url: string;

      if (isFullContractSignature) {
        // Signature complète du contrat par le client
        url = `/api/contracts/${contractId}/sign`;
      } else if (stepId) {
        // Signature d'une étape par le prestataire
        url = `/api/contracts/${contractId}/steps/${stepId}/sign`;
      } else {
        throw new Error("Configuration de signature invalide");
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la signature');
      }

      // Appeler le callback de succès
      if (onSignatureComplete) {
        onSignatureComplete();
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la signature');
      console.error('Erreur de signature:', err);
    } finally {
      setIsSigning(false);
    }
  };

  if (!canSign) {
    return null;
  }

  const getButtonConfig = () => {
    if (isFullContractSignature) {
      return {
        text: 'Signer le contrat',
        icon: FileSignature,
        className: 'bg-blue-600 hover:bg-blue-700 text-white',
      };
    } else {
      return {
        text: 'Signer l\'étape',
        icon: CheckCircle,
        className: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      };
    }
  };

  const buttonConfig = getButtonConfig();
  const IconComponent = buttonConfig.icon;

  return (
    <div className="space-y-2">
      <Button
        onClick={handleSign}
        disabled={isSigning || disabled}
        className={buttonConfig.className}
        size="sm"
      >
        {isSigning ? (
          <>
            <Clock className="w-4 h-4 mr-2 animate-spin" />
            Signature en cours...
          </>
        ) : (
          <>
            <IconComponent className="w-4 h-4 mr-2" />
            {buttonConfig.text}
          </>
        )}
      </Button>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
