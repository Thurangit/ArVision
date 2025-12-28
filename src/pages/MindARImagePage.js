import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const MindARImagePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Détecter l'orientation et forcer le mode paysage sur mobile
  useEffect(() => {
    const checkOrientation = () => {
      const isPortraitMode = window.innerHeight > window.innerWidth;
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;

      setIsPortrait(isPortraitMode);
      setIsMobile(isMobileDevice);

      // Forcer l'orientation paysage sur mobile si disponible
      if (isMobileDevice && isPortraitMode && window.screen && window.screen.orientation && window.screen.orientation.lock) {
        window.screen.orientation.lock('landscape').catch(err => {
          console.log('Impossible de verrouiller l\'orientation:', err);
        });
      }
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Initialisation MindAR
  useEffect(() => {

    // Vérifier que A-Frame est chargé
    if (typeof window === 'undefined' || !window.AFRAME) {
      console.error('A-Frame n\'est pas chargé');
      setIsLoading(false);
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

      // Définir les handlers d'événements MindAR (en dehors de setupMindARListeners pour qu'ils soient accessibles)
      const arReadyHandler = () => {
        console.log('✅ MindAR Image Tracking prêt - Caméra activée');
        setIsLoading(false);
      };

      const arErrorHandler = (event) => {
        console.error('❌ Erreur MindAR:', event);
        setIsLoading(false);
      };

      // Écouter l'événement de chargement du fichier .mind
      const mindLoadedHandler = () => {
        console.log('📦 Fichier .mind chargé');
      };

      // Attendre que la scène soit complètement initialisée avant d'écouter les événements
      const waitForSceneReady = () => {
        const camera = scene.querySelector('a-camera');
        if (!camera || !camera.object3D) {
          setTimeout(waitForSceneReady, 100);
          return;
        }

        // S'assurer que la caméra a un object3D avant de continuer
        if (!camera.components || !camera.components.camera) {
          setTimeout(waitForSceneReady, 100);
          return;
        }

        console.log('✅ Scène et caméra prêtes');

        // Ajouter les event listeners maintenant que la scène est prête
        scene.addEventListener('arReady', arReadyHandler);
        scene.addEventListener('arError', arErrorHandler);
        scene.addEventListener('mindar-image-loaded', mindLoadedHandler);

        // Stocker les handlers pour le nettoyage
        scene._arReadyHandler = arReadyHandler;
        scene._arErrorHandler = arErrorHandler;
        scene._mindLoadedHandler = mindLoadedHandler;
      };

      // Démarrer l'attente de la scène
      waitForSceneReady();

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

      // Timeout de sécurité pour cacher le loader
      setTimeout(() => {
        setIsLoading(false);
      }, 5000);
    };

    // Démarrer l'initialisation après un court délai pour laisser React rendre
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

        // Arrêter proprement MindAR pour libérer la caméra
        try {
          if (scene.components && scene.components['mindar-image-system']) {
            const mindarSystem = scene.components['mindar-image-system'];
            if (mindarSystem && typeof mindarSystem.stopProcessVideo === 'function') {
              mindarSystem.stopProcessVideo();
            }
            if (mindarSystem && typeof mindarSystem.stop === 'function') {
              mindarSystem.stop();
            }
          }
        } catch (error) {
          console.warn('⚠️ Erreur lors de l\'arrêt de MindAR:', error);
        }

        // Arrêter tous les streams vidéo
        const video = scene.querySelector('video');
        if (video && video.srcObject) {
          const stream = video.srcObject;
          const tracks = stream.getTracks();
          tracks.forEach(track => {
            track.stop();
            console.log('📹 Piste vidéo arrêtée');
          });
          video.srcObject = null;
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

      // Réinitialiser le flag
      isInitialized = false;
    };
  }, []);

  // Fonction pour forcer le mode paysage
  const forceLandscape = async () => {
    if (window.screen && window.screen.orientation && window.screen.orientation.lock) {
      try {
        await window.screen.orientation.lock('landscape');
        console.log('✅ Orientation verrouillée en mode paysage');
      } catch (err) {
        console.log('⚠️ Impossible de verrouiller l\'orientation:', err);
        // Afficher un message à l'utilisateur
        alert('Veuillez tourner votre appareil en mode paysage manuellement. Le verrouillage automatique n\'est pas disponible sur votre navigateur.');
      }
    } else {
      // Fallback pour les navigateurs qui ne supportent pas l'API
      alert('Veuillez tourner votre appareil en mode paysage. Votre navigateur ne supporte pas le verrouillage automatique de l\'orientation.');
    }
  };

  return (
    <div className="ar-page-container">
      {/* Message pour forcer le mode paysage sur mobile */}
      {isMobile && isPortrait && (
        <div className="portrait-warning">
          <div>
            <div style={{ fontSize: '3em', marginBottom: '1em' }}>📱</div>
            <div style={{ fontSize: '1.2em', fontWeight: 'bold', marginBottom: '1em' }}>
              Veuillez tourner votre appareil en mode paysage
            </div>
            <div style={{ marginBottom: '2em' }}>
              Pour une meilleure expérience, cette application fonctionne uniquement en mode paysage
            </div>
            <button
              onClick={forceLandscape}
              style={{
                padding: '15px 30px',
                fontSize: '16px',
                fontWeight: 'bold',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#45a049'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#4CAF50'}
            >
              🔄 Activer le mode paysage
            </button>
          </div>
        </div>
      )}

      {/* Loader */}
      {isLoading && (
        <div className="arjs-loader">
          <div>
            <div style={{ fontSize: '1.5em', marginBottom: '1em' }}>⏳</div>
            <div>Chargement MindAR Image Tracking...</div>
          </div>
        </div>
      )}

      {/* Indicateur de tracking - NE DOIT PAS BLOQUER */}
      {!isLoading && (!isMobile || !isPortrait) && (
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
            pointerEvents: 'none', // ⚠️ CRITIQUE : ne bloque pas la scène
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

      {/* Bouton retour - SEUL élément cliquable */}
      {(!isMobile || !isPortrait) && (
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
            pointerEvents: 'auto', // SEUL ce bouton est cliquable
            display: 'block',
            userSelect: 'none',
            touchAction: 'manipulation'
          }}
        >
          ← Retour
        </Link>
      )}

      {/* Scène MindAR Image Tracking - Configuration optimisée */}
      {(!isMobile || !isPortrait) && (
        <a-scene
          mindar-image="imageTargetSrc: /composant/image-a-reconnaitre/personne.mind; filterMinCF: 0.001; filterBeta: 5; warmupTolerance: 3; missTolerance: 5; uiLoading: no; uiError: no; uiScanning: no; autoStart: true; maxTrack: 1;"
          vr-mode-ui="enabled: false"
          device-orientation-permission-ui="enabled: false"
          embedded
          renderer="colorManagement: true; physicallyCorrectLights: false;"
        >
          {/* Caméra selon la doc - Laisser MindAR gérer le fov */}
          <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>

          {/* Entity avec mindar-image-target selon la doc exacte */}
          <a-entity mindar-image-target="targetIndex: 0">
            {/* Plan bleu pour overlay l'image (exactement comme dans la doc) */}
            <a-plane
              color="blue"
              opacity="0.5"
              position="0 0 0"
              height="0.552"
              width="1"
              rotation="0 0 0"
            ></a-plane>

            {/* Contenu 3D à afficher au-dessus de l'image - Animations stabilisées */}
            <a-box
              position="0 0.5 0"
              rotation="0 45 0"
              color="#4CC3D9"
              scale="0.5 0.5 0.5"
              animation="property: rotation; to: 0 405 0; loop: true; dur: 10000; easing: linear"
            ></a-box>

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
            >                    </a-text>
          </a-entity>
        </a-scene>
      )}


      {/* Styles CSS natifs - Laisser MindAR gérer le rendu */}
      <style>{`
        .arjs-loader {
          height: 100vh;
          width: 100vw;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
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

        /* Message d'avertissement mode portrait sur mobile */
        .portrait-warning {
          display: flex;
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.95);
          z-index: 99999;
          justify-content: center;
          align-items: center;
          color: white;
          font-size: 1.2em;
          text-align: center;
          padding: 20px;
        }

        .portrait-warning div {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        /* CRITIQUE : Éléments UI qui ne doivent pas bloquer */
        .ui-overlay-element {
          pointer-events: none !important;
        }

        /* Styles pour la scène MindAR - Laisser MindAR gérer nativement */
        a-scene {
          width: 100%;
          height: 100%;
          position: fixed;
          top: 0;
          left: 0;
          margin: 0;
          padding: 0;
        }

        /* Vidéo de la caméra - CSS simple sans manipulation JavaScript */
        a-scene video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center center;
          position: fixed;
          top: 0;
          left: 0;
          margin: 0;
          padding: 0;
        }

        /* Canvas A-Frame */
        a-scene canvas {
          width: 100%;
          height: 100%;
          position: fixed;
          top: 0;
          left: 0;
          margin: 0;
          padding: 0;
        }

        /* Styles spécifiques pour mobile - Responsive */
        @media (max-width: 768px) {
          a-scene {
            width: 100vw;
            height: 100vh;
          }

          a-scene video {
            width: 100vw;
            height: 100vh;
            object-fit: cover;
            object-position: center center;
          }

          a-scene canvas {
            width: 100vw;
            height: 100vh;
          }
        }

        /* Gestion des deux orientations - Plein écran dans les deux cas */
        @media (orientation: landscape) {
          a-scene {
            width: 100vw !important;
            height: 100vh !important;
          }

          a-scene video {
            width: 100vw !important;
            height: 100vh !important;
            object-fit: cover !important;
            object-position: center center !important;
          }

          a-scene canvas {
            width: 100vw !important;
            height: 100vh !important;
          }
        }

        @media (orientation: portrait) {
          a-scene {
            width: 100vw !important;
            height: 100vh !important;
          }

          a-scene video {
            width: 100vw !important;
            height: 100vh !important;
            object-fit: cover !important;
            object-position: center center !important;
          }

          a-scene canvas {
            width: 100vw !important;
            height: 100vh !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MindARImagePage;
