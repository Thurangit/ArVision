import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';

const MindARImagePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const deferredPromptRef = useRef(null);

  // Détecter si l'app est installée en PWA
  useEffect(() => {
    // Détecter le prompt d'installation PWA
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      // Afficher le prompt après 3 secondes si pas encore installé
      setTimeout(() => {
        if (window.matchMedia('(display-mode: standalone)').matches) {
          setShowInstallPrompt(false);
        } else {
          setShowInstallPrompt(true);
        }
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Fonction pour obtenir un message d'erreur spécifique par navigateur
  const getCameraErrorMessage = (error) => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isEdge = /Edg/.test(navigator.userAgent);
    const isSamsung = /SamsungBrowser/.test(navigator.userAgent);
    const isOpera = /OPR|Opera/.test(navigator.userAgent);

    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      if (isIOS && isSafari) {
        return {
          title: 'Autorisation caméra requise',
          message: 'Sur iOS Safari, autorisez l\'accès à la caméra dans Réglages > Safari > Caméra. L\'application nécessite HTTPS.',
          isHTTPS: window.location.protocol !== 'https:'
        };
      } else if (isAndroid) {
        return {
          title: 'Autorisation caméra requise',
          message: 'Autorisez l\'accès à la caméra dans les paramètres de votre navigateur ou installez l\'application en PWA pour une meilleure expérience.',
          showInstall: true
        };
      } else if (isEdge || isSamsung || isOpera) {
        return {
          title: 'Autorisation caméra requise',
          message: 'Cliquez sur l\'icône de caméra dans la barre d\'adresse pour autoriser l\'accès, ou installez l\'application en PWA.',
          showInstall: true
        };
      }
      return {
        title: 'Autorisation caméra refusée',
        message: 'Veuillez autoriser l\'accès à la caméra dans les paramètres de votre navigateur.'
      };
    }

    if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      return {
        title: 'Caméra non trouvée',
        message: 'Aucune caméra n\'a été détectée sur cet appareil.'
      };
    }

    if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      return {
        title: 'Caméra déjà utilisée',
        message: 'La caméra est déjà utilisée par une autre application. Fermez les autres applications utilisant la caméra.'
      };
    }

    if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
      return {
        title: 'Configuration caméra non supportée',
        message: 'Les paramètres de caméra demandés ne sont pas supportés par cet appareil.'
      };
    }

    return {
      title: 'Erreur d\'accès à la caméra',
      message: `Erreur: ${error.message || error.name}. Vérifiez les permissions de votre navigateur.`
    };
  };

  // Obtenir le flux vidéo de la caméra avec l'API native
  useEffect(() => {
    const getCameraStream = async () => {
      // Vérifier que getUserMedia est disponible
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const isHTTPS = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
        setCameraError({
          title: 'API caméra non disponible',
          message: isHTTPS
            ? 'Votre navigateur ne supporte pas l\'accès à la caméra. Essayez avec Chrome, Firefox ou Edge récent.'
            : 'L\'accès à la caméra nécessite HTTPS. Veuillez utiliser une connexion sécurisée.',
          isHTTPS: !isHTTPS
        });
        setIsLoading(false);
        return;
      }

      try {
        // Demander l'accès à la caméra avec contraintes flexibles pour compatibilité mobile
        // Essayer d'abord avec des contraintes idéales
        let constraints = {
          video: {
            facingMode: { ideal: 'environment' }, // Caméra arrière sur mobile
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        };

        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (firstError) {
          // Si échec, essayer avec des contraintes plus simples
          console.warn('⚠️ Contraintes idéales non supportées, essai avec contraintes simples');
          constraints = {
            video: {
              facingMode: 'environment'
            },
            audio: false
          };

          try {
            stream = await navigator.mediaDevices.getUserMedia(constraints);
          } catch (secondError) {
            // Dernier essai avec contraintes minimales
            console.warn('⚠️ Contraintes simples non supportées, essai avec contraintes minimales');
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          }
        }
        streamRef.current = stream;

        // Attendre que la vidéo soit prête
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().then(() => {
            console.log('✅ Caméra activée avec succès');
            setIsLoading(false);
            setCameraError(null);
          }).catch(err => {
            // Ignorer les erreurs AbortError (normales en mode dev React)
            if (err.name !== 'AbortError') {
              console.error('❌ Erreur lors de la lecture de la vidéo:', err);
              const errorMsg = getCameraErrorMessage(err);
              setCameraError(errorMsg);
            }
            setIsLoading(false);
          });
        }
      } catch (error) {
        console.error('❌ Erreur d\'accès à la caméra:', error);
        const errorMsg = getCameraErrorMessage(error);
        setCameraError(errorMsg);
        setIsLoading(false);
      }
    };

    getCameraStream();

    // Nettoyage
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
          console.log('📹 Piste vidéo arrêtée');
        });
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  // Initialisation MindAR
  useEffect(() => {
    // Vérifier que A-Frame est chargé
    if (typeof window === 'undefined' || !window.AFRAME) {
      console.error('A-Frame n\'est pas chargé');
      return;
    }

    let isInitialized = false;
    let initTimeout = null;

    // Attendre que React ait rendu la scène dans le DOM
    const initMindAR = () => {
      // Éviter les initialisations multiples
      if (isInitialized) {
        return;
      }

      const scene = document.querySelector('a-scene');
      if (!scene) {
        if (initTimeout) clearTimeout(initTimeout);
        initTimeout = setTimeout(initMindAR, 100);
        return;
      }

      // Vérifier que la scène a l'attribut mindar-image
      if (!scene.hasAttribute('mindar-image')) {
        if (initTimeout) clearTimeout(initTimeout);
        initTimeout = setTimeout(initMindAR, 100);
        return;
      }

      // Marquer comme initialisé
      isInitialized = true;
      console.log('✅ Scène MindAR trouvée, initialisation...');

      // Obtenir le système MindAR
      let arSystem = null;

      const sceneLoadedHandler = () => {
        arSystem = scene.systems && scene.systems["mindar-image-system"];
        if (arSystem) {
          console.log('✅ Système MindAR chargé');
          // Stocker le système pour le nettoyage
          scene._arSystem = arSystem;
        }
      };

      scene.addEventListener('loaded', sceneLoadedHandler);

      // Définir les handlers d'événements MindAR
      const arReadyHandler = () => {
        console.log('✅ MindAR Image Tracking prêt');
      };

      const arErrorHandler = (event) => {
        console.error('❌ Erreur MindAR:', event);
      };

      const mindLoadedHandler = () => {
        console.log('📦 Fichier .mind chargé');
      };

      // Ajouter les event listeners sur la scène
      scene.addEventListener('arReady', arReadyHandler);
      scene.addEventListener('arError', arErrorHandler);
      scene.addEventListener('mindar-image-loaded', mindLoadedHandler);

      // Stocker les handlers pour le nettoyage
      scene._arReadyHandler = arReadyHandler;
      scene._arErrorHandler = arErrorHandler;
      scene._mindLoadedHandler = mindLoadedHandler;
      scene._sceneLoadedHandler = sceneLoadedHandler;

      // Écouter les événements de tracking via l'entité
      const targetEntity = scene.querySelector('[mindar-image-target]');
      if (targetEntity) {
        const targetFoundHandler = () => {
          console.log('✅ Image détectée');
          setIsTracking(true);
        };

        const targetLostHandler = () => {
          console.log('❌ Image perdue');
          setIsTracking(false);
        };

        targetEntity.addEventListener('targetFound', targetFoundHandler);
        targetEntity.addEventListener('targetLost', targetLostHandler);

        // Stocker les handlers pour le nettoyage
        targetEntity._targetFoundHandler = targetFoundHandler;
        targetEntity._targetLostHandler = targetLostHandler;
      }
    };

    // Démarrer l'initialisation après un court délai
    const timeout = setTimeout(() => {
      initMindAR();
    }, 1000);

    // Nettoyage
    return () => {
      if (initTimeout) clearTimeout(initTimeout);
      clearTimeout(timeout);

      const scene = document.querySelector('a-scene');
      if (scene) {
        // Nettoyer les event listeners
        if (scene._arReadyHandler) {
          scene.removeEventListener('arReady', scene._arReadyHandler);
        }
        if (scene._arErrorHandler) {
          scene.removeEventListener('arError', scene._arErrorHandler);
        }
        if (scene._mindLoadedHandler) {
          scene.removeEventListener('mindar-image-loaded', scene._mindLoadedHandler);
        }
        if (scene._sceneLoadedHandler) {
          scene.removeEventListener('loaded', scene._sceneLoadedHandler);
        }

        // Arrêter proprement MindAR seulement si le système est complètement initialisé
        try {
          // Vérifier d'abord si le système existe et est initialisé
          const arSystem = scene._arSystem || (scene.systems && scene.systems["mindar-image-system"]);

          if (arSystem) {
            // Vérifier que le système a les méthodes nécessaires avant d'appeler stop
            if (typeof arSystem.stop === 'function' && arSystem.video && arSystem.video.processor) {
              arSystem.stop();
              console.log('✅ MindAR arrêté proprement');
            } else {
              // Le système n'est pas complètement initialisé, on essaie juste de pause
              if (typeof arSystem.pause === 'function') {
                arSystem.pause();
                console.log('✅ MindAR mis en pause');
              }
            }
          }
        } catch (error) {
          // Ignorer les erreurs silencieusement si le système n'est pas initialisé
          if (error.message && !error.message.includes('stopProcessVideo')) {
            console.warn('⚠️ Erreur lors de l\'arrêt de MindAR:', error);
          }
        }
      }

      const targetEntity = document.querySelector('[mindar-image-target]');
      if (targetEntity) {
        if (targetEntity._targetFoundHandler) {
          targetEntity.removeEventListener('targetFound', targetEntity._targetFoundHandler);
        }
        if (targetEntity._targetLostHandler) {
          targetEntity.removeEventListener('targetLost', targetEntity._targetLostHandler);
        }
      }

      isInitialized = false;
    };
  }, []);

  return (
    <div className="ar-page-container">
      {/* Loader */}
      {isLoading && (
        <div className="arjs-loader">
          <div>
            <div style={{ fontSize: '1.5em', marginBottom: '1em' }}>⏳</div>
            <div>Chargement de la caméra...</div>
          </div>
        </div>
      )}

      {/* Message d'erreur caméra avec instructions spécifiques */}
      {cameraError && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10001,
            padding: '25px',
            backgroundColor: 'rgba(220, 38, 38, 0.95)',
            color: 'white',
            borderRadius: '15px',
            textAlign: 'center',
            maxWidth: '90%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
          }}
        >
          <div style={{ fontSize: '1.3em', marginBottom: '15px', fontWeight: 'bold' }}>
            ❌ {cameraError.title || 'Erreur'}
          </div>
          <div style={{ fontSize: '0.95em', marginBottom: '20px', lineHeight: '1.5' }}>
            {cameraError.message || cameraError}
          </div>

          {/* Message HTTPS pour iOS */}
          {cameraError.isHTTPS && (
            <div style={{
              fontSize: '0.85em',
              marginTop: '15px',
              padding: '10px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '8px'
            }}>
              ⚠️ Sur iOS Safari, l'accès à la caméra nécessite HTTPS. Utilisez une connexion sécurisée.
            </div>
          )}

          {/* Bouton d'installation PWA */}
          {(cameraError.showInstall || showInstallPrompt) && deferredPromptRef.current && (
            <button
              onClick={async () => {
                if (deferredPromptRef.current) {
                  deferredPromptRef.current.prompt();
                  const { outcome } = await deferredPromptRef.current.userChoice;
                  console.log(`Installation PWA: ${outcome}`);
                  deferredPromptRef.current = null;
                  setShowInstallPrompt(false);
                }
              }}
              style={{
                marginTop: '15px',
                padding: '12px 24px',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1em',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              📱 Installer l'application
            </button>
          )}

          {/* Instructions iOS Safari */}
          {/iPad|iPhone|iPod/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent) && (
            <div style={{
              fontSize: '0.85em',
              marginTop: '15px',
              padding: '10px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '8px',
              textAlign: 'left'
            }}>
              <strong>Instructions iOS Safari:</strong>
              <ol style={{ margin: '10px 0', paddingLeft: '20px' }}>
                <li>Appuyez sur le bouton "Partager" (📤)</li>
                <li>Sélectionnez "Sur l'écran d'accueil"</li>
                <li>Ouvrez l'application depuis l'écran d'accueil</li>
                <li>Autorisez l'accès à la caméra quand demandé</li>
              </ol>
            </div>
          )}

          {/* Instructions Android */}
          {/Android/.test(navigator.userAgent) && (
            <div style={{
              fontSize: '0.85em',
              marginTop: '15px',
              padding: '10px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '8px',
              textAlign: 'left'
            }}>
              <strong>Instructions Android:</strong>
              <ol style={{ margin: '10px 0', paddingLeft: '20px' }}>
                <li>Appuyez sur le menu (⋮) dans le navigateur</li>
                <li>Sélectionnez "Ajouter à l'écran d'accueil" ou "Installer l'application"</li>
                <li>Ouvrez l'application installée</li>
                <li>Autorisez l'accès à la caméra dans les paramètres si nécessaire</li>
              </ol>
            </div>
          )}

          <button
            onClick={() => {
              setCameraError(null);
              window.location.reload();
            }}
            style={{
              marginTop: '15px',
              padding: '10px 20px',
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              color: 'white',
              border: '2px solid white',
              borderRadius: '8px',
              fontSize: '0.9em',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            🔄 Réessayer
          </button>
        </div>
      )}

      {/* Prompt d'installation PWA (si pas d'erreur) */}
      {showInstallPrompt && !cameraError && deferredPromptRef.current && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10001,
            padding: '15px 20px',
            backgroundColor: 'rgba(37, 99, 235, 0.95)',
            color: 'white',
            borderRadius: '12px',
            textAlign: 'center',
            maxWidth: '90%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}
        >
          <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
            📱 Installer ArVision pour une meilleure expérience
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={async () => {
                if (deferredPromptRef.current) {
                  deferredPromptRef.current.prompt();
                  const { outcome } = await deferredPromptRef.current.userChoice;
                  console.log(`Installation PWA: ${outcome}`);
                  deferredPromptRef.current = null;
                  setShowInstallPrompt(false);
                }
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: 'white',
                color: '#2563eb',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9em',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Installer
            </button>
            <button
              onClick={() => setShowInstallPrompt(false)}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: 'white',
                border: '1px solid white',
                borderRadius: '8px',
                fontSize: '0.9em',
                cursor: 'pointer'
              }}
            >
              Plus tard
            </button>
          </div>
        </div>
      )}

      {/* Indicateur de tracking */}
      {!isLoading && !cameraError && (
        <div
          className="ui-overlay-element"
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10000,
            padding: '10px 20px',
            backgroundColor: isTracking ? 'rgba(76, 175, 80, 0.9)' : 'rgba(255, 152, 0, 0.9)',
            color: 'white',
            borderRadius: '25px',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
            transition: 'all 0.3s ease',
            pointerEvents: 'none',
            userSelect: 'none',
            touchAction: 'none'
          }}
        >
          {isTracking
            ? '✓ Image détectée'
            : '📷 Cherchez l\'image à tracker'
          }
        </div>
      )}

      {/* Bouton retour */}
      <Link
        to="/"
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 10000,
          padding: '10px 20px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '25px',
          fontSize: '14px',
          fontWeight: 'bold',
          transition: 'all 0.3s ease',
          pointerEvents: 'auto',
          display: 'block',
          userSelect: 'none',
          touchAction: 'manipulation'
        }}
      >
        ← Retour
      </Link>

      {/* Vidéo de la caméra - Contrôlée par nous */}
      {!cameraError && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            objectFit: 'cover',
            objectPosition: 'center center',
            zIndex: 1
          }}
        />
      )}

      {/* Scène MindAR Image Tracking - Pour le tracking AR uniquement */}
      <a-scene
        mindar-image="imageTargetSrc: /composant/image-a-reconnaitre/personne.mind; filterMinCF: 0.001; filterBeta: 5; warmupTolerance: 3; missTolerance: 5; uiLoading: no; uiError: no; uiScanning: no; autoStart: true; maxTrack: 1;"
        vr-mode-ui="enabled: false"
        device-orientation-permission-ui="enabled: false"
        embedded
        renderer="colorManagement: true; physicallyCorrectLights: false;"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 2,
          pointerEvents: 'none'
        }}
      >
        <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>

        <a-entity mindar-image-target="targetIndex: 0">
          <a-plane
            color="blue"
            opacity="0.5"
            position="0 0 0"
            height="0.552"
            width="1"
            rotation="0 0 0"
          ></a-plane>

          <a-box
            position="0 0.5 0"
            rotation="0 45 0"
            color="#4CC3D9"
            scale="0.5 0.5 0.5"
            animation="property: rotation; to: 0 405 0; loop: true; dur: 10000; easing: linear"
          ></a-box>

          {/* Plan de fond pour le texte de description (derrière le texte) */}
          <a-plane
            position="0 1.5 -0.01"
            width="5.5"
            height="1.3"
            color="#000000"
            opacity="0.75"
            rotation="0 0 0"
          ></a-plane>

          {/* Texte de description AR - S'affiche quand l'image est détectée */}
          <a-text
            value="C'est une jolie fille brune en jacquette et chemise"
            position="0 1.5 0"
            align="center"
            color="#FFFFFF"
            scale="1.5 1.5 1.5"
            width="10"
            wrap-count="25"
          ></a-text>

          <a-text
            value="Bonjour"
            position="0 1.2 0"
            align="center"
            color="#4ECDC4"
            scale="2 2 2"
          ></a-text>

          <a-text
            value="MindAR"
            position="0 0.8 0"
            align="center"
            color="#FF6B6B"
            scale="1.5 1.5 1.5"
          ></a-text>
        </a-entity>
      </a-scene>

      {/* Styles CSS */}
      <style>{`
        .arjs-loader {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.8);
          z-index: 9999;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .arjs-loader div {
          text-align: center;
          font-size: 1.25em;
          color: white;
        }

        .ui-overlay-element {
          pointer-events: none !important;
        }

        .ar-page-container {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }

        /* Masquer la vidéo créée par MindAR */
        a-scene video {
          display: none !important;
        }

        /* Canvas A-Frame transparent pour le tracking */
        a-scene canvas {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          z-index: 2 !important;
          pointer-events: none !important;
        }
      `}</style>
    </div>
  );
};

export default MindARImagePage;
