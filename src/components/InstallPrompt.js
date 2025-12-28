import React, { useState, useEffect } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

/**
 * Composant pour afficher le prompt d'installation PWA
 * S'affiche automatiquement à l'ouverture si l'app n'est pas installée
 */
const InstallPrompt = ({ autoShow = true, delay = 3000 }) => {
  const { isInstalled, isInstallable, isIOS, install, getIOSInstructions } = usePWAInstall();
  const [show, setShow] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Vérifier si le prompt a déjà été rejeté (localStorage)
    const wasDismissed = localStorage.getItem('pwa-install-dismissed');
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    // Ne pas afficher si déjà installé
    if (isInstalled) {
      return;
    }

    // Afficher automatiquement après un délai si activé
    if (autoShow && (isInstallable || isIOS)) {
      const timer = setTimeout(() => {
        setShow(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isInstalled, isInstallable, isIOS, autoShow, delay]);

  const handleInstall = async () => {
    if (isIOS) {
      // Pour iOS, afficher les instructions
      setShowIOSInstructions(true);
    } else {
      // Pour Chrome/Edge, déclencher l'installation
      const success = await install();
      if (success) {
        setShow(false);
      }
    }
  };

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    // Sauvegarder dans localStorage pour ne plus afficher
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Ne rien afficher si déjà installé ou rejeté
  if (isInstalled || dismissed || !show) {
    return null;
  }

  const iosInstructions = getIOSInstructions();

  return (
    <>
      {/* Overlay avec prompt d'installation */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={handleDismiss}
      >
        <div
          className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* En-tête */}
          <div className="text-center mb-4">
            <div className="text-5xl mb-3">📱</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Installer ArVision
            </h3>
            <p className="text-gray-600">
              Installez l'application pour une meilleure expérience et un accès rapide
            </p>
          </div>

          {/* Instructions iOS */}
          {showIOSInstructions && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">
                {iosInstructions.title}
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                {iosInstructions.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Boutons */}
          <div className="flex gap-3">
            <button
              onClick={handleDismiss}
              className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors"
            >
              Plus tard
            </button>
            <button
              onClick={handleInstall}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              {isIOS ? 'Voir instructions' : 'Installer'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstallPrompt;

