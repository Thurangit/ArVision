import { useState, useEffect } from 'react';

/**
 * Hook personnalisé pour gérer l'installation PWA
 * Supporte Chrome, Edge, Safari iOS, et autres navigateurs
 */
export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Détecter iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // Détecter si l'app est déjà installée (mode standalone)
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone ||
      document.referrer.includes('android-app://');
    setIsStandalone(standalone);
    setIsInstalled(standalone);

    // Écouter l'événement beforeinstallprompt (Chrome, Edge, etc.)
    const handleBeforeInstallPrompt = (e) => {
      // Empêcher le prompt par défaut
      e.preventDefault();
      // Sauvegarder l'événement pour l'utiliser plus tard
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Vérifier si l'app est déjà installée
    if (standalone) {
      setIsInstalled(true);
      setIsInstallable(false);
    }

    // Nettoyage
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  /**
   * Fonction pour installer l'application
   */
  const install = async () => {
    if (!isInstallable && !isIOS) {
      return false;
    }

    // Pour Chrome/Edge (beforeinstallprompt)
    if (deferredPrompt) {
      // Afficher le prompt d'installation
      deferredPrompt.prompt();

      // Attendre la réponse de l'utilisateur
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('Utilisateur a accepté l\'installation');
        setDeferredPrompt(null);
        setIsInstallable(false);
        setIsInstalled(true);
        return true;
      } else {
        console.log('Utilisateur a refusé l\'installation');
        return false;
      }
    }

    // Pour iOS Safari, on ne peut pas déclencher l'installation automatiquement
    // On doit afficher des instructions
    if (isIOS && !isStandalone) {
      // Retourner false pour que le composant affiche les instructions iOS
      return false;
    }

    return false;
  };

  /**
   * Obtenir les instructions d'installation pour iOS
   */
  const getIOSInstructions = () => {
    return {
      title: 'Installer ArVision sur iOS',
      steps: [
        'Appuyez sur le bouton de partage (📤) en bas de l\'écran',
        'Faites défiler et sélectionnez "Sur l\'écran d\'accueil"',
        'Appuyez sur "Ajouter" pour installer l\'application'
      ]
    };
  };

  return {
    isInstalled,
    isInstallable: isInstallable || (isIOS && !isStandalone),
    isIOS,
    isStandalone,
    install,
    getIOSInstructions
  };
};

