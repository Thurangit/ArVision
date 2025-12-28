import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

/**
 * Bouton d'installation PWA pour la page d'accueil
 */
const InstallButton = ({ className = '' }) => {
  const { isInstalled, isInstallable, isIOS, install, getIOSInstructions } = usePWAInstall();
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  // Ne pas afficher si déjà installé
  if (isInstalled) {
    return null;
  }

  // Ne pas afficher si pas installable
  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleInstall = async () => {
    if (isIOS) {
      // Pour iOS, afficher/masquer les instructions
      setShowIOSInstructions(!showIOSInstructions);
    } else {
      // Pour Chrome/Edge, déclencher l'installation
      await install();
    }
  };

  const iosInstructions = getIOSInstructions();

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleInstall}
        className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
      >
        <span className="text-2xl">📱</span>
        <span>{isIOS ? 'Installer l\'application' : 'Installer ArVision'}</span>
      </button>

      {/* Instructions iOS (affichées en dessous du bouton) */}
      {showIOSInstructions && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-gray-800 mb-2">
            {iosInstructions.title}
          </h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            {iosInstructions.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
          <button
            onClick={() => setShowIOSInstructions(false)}
            className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Fermer
          </button>
        </div>
      )}
    </div>
  );
};

export default InstallButton;

