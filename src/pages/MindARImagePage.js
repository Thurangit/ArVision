import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const MindARImagePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    // Vérifier que A-Frame est chargé
    if (typeof window === 'undefined' || !window.AFRAME) {
      console.error('A-Frame n\'est pas chargé');
      setIsLoading(false);
      return;
    }

    // Attendre que React ait rendu la scène dans le DOM
    const initMindAR = () => {
      const scene = document.querySelector('a-scene');
      if (!scene) {
        setTimeout(initMindAR, 100);
        return;
      }

      // Vérifier que la scène a l'attribut mindar-image
      if (!scene.hasAttribute('mindar-image')) {
        setTimeout(initMindAR, 100);
        return;
      }

      console.log('✅ Scène MindAR trouvée, initialisation...');

      // Fonction pour ajuster la vidéo en plein écran
      const adjustVideoFullScreen = () => {
        const video = scene.querySelector('video');
        if (video) {
          // Utiliser les dimensions réelles de l'écran
          const screenWidth = window.innerWidth;
          const screenHeight = window.innerHeight;

          // Forcer les dimensions exactes
          video.style.setProperty('width', screenWidth + 'px', 'important');
          video.style.setProperty('height', screenHeight + 'px', 'important');
          video.style.setProperty('min-width', screenWidth + 'px', 'important');
          video.style.setProperty('min-height', screenHeight + 'px', 'important');
          video.style.setProperty('max-width', screenWidth + 'px', 'important');
          video.style.setProperty('max-height', screenHeight + 'px', 'important');
          video.style.setProperty('object-fit', 'cover', 'important');
          video.style.setProperty('object-position', 'center center', 'important');
          video.style.setProperty('position', 'fixed', 'important');
          video.style.setProperty('top', '0', 'important');
          video.style.setProperty('left', '0', 'important');
          video.style.setProperty('right', '0', 'important');
          video.style.setProperty('bottom', '0', 'important');
          video.style.setProperty('margin', '0', 'important');
          video.style.setProperty('padding', '0', 'important');
          video.style.setProperty('transform', 'none', 'important');

          console.log('📹 Vidéo ajustée en plein écran:', screenWidth + 'x' + screenHeight);
        }
      };

      // Écouter les événements MindAR
      const arReadyHandler = () => {
        console.log('✅ MindAR Image Tracking prêt - Caméra activée');
        setIsLoading(false);

        // Ajuster la vidéo après un court délai
        setTimeout(() => {
          adjustVideoFullScreen();
        }, 500);
      };

      const arErrorHandler = (event) => {
        console.error('❌ Erreur MindAR:', event);
        setIsLoading(false);
      };

      // Écouter l'événement de chargement du fichier .mind
      const mindLoadedHandler = () => {
        console.log('📦 Fichier .mind chargé');
      };

      scene.addEventListener('arReady', arReadyHandler);
      scene.addEventListener('arError', arErrorHandler);
      scene.addEventListener('mindar-image-loaded', mindLoadedHandler);

      // Vérifier périodiquement et ajuster la vidéo si nécessaire
      const videoCheckInterval = setInterval(() => {
        const video = scene.querySelector('video');
        if (video && video.readyState >= 2) {
          adjustVideoFullScreen();
        }
      }, 1000);

      // Arrêter après 10 secondes
      setTimeout(() => {
        clearInterval(videoCheckInterval);
      }, 10000);

      // Stocker l'interval pour le nettoyage
      scene._videoCheckInterval = videoCheckInterval;

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

      // Stocker les handlers pour le nettoyage
      scene._arReadyHandler = arReadyHandler;
      scene._arErrorHandler = arErrorHandler;
      scene._mindLoadedHandler = mindLoadedHandler;

      // Écouter le redimensionnement de la fenêtre
      const resizeHandler = () => {
        adjustVideoFullScreen();
      };
      window.addEventListener('resize', resizeHandler);
      scene._resizeHandler = resizeHandler;

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
      clearTimeout(timeout);
      const scene = document.querySelector('a-scene');
      if (scene) {
        if (scene._arReadyHandler) {
          scene.removeEventListener('arReady', scene._arReadyHandler);
        }
        if (scene._arErrorHandler) {
          scene.removeEventListener('arError', scene._arErrorHandler);
        }
        if (scene._mindLoadedHandler) {
          scene.removeEventListener('mindar-image-loaded', scene._mindLoadedHandler);
        }
        if (scene._videoCheckInterval) {
          clearInterval(scene._videoCheckInterval);
        }
        if (scene._resizeHandler) {
          window.removeEventListener('resize', scene._resizeHandler);
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
    };
  }, []);

  return (
    <div className="ar-page-container">
      {/* Loader */}
      {isLoading && (
        <div className="arjs-loader">
          <div>
            <div style={{ fontSize: '1.5em', marginBottom: '1em' }}>⏳</div>
            <div>Chargement MindAR Image Tracking...</div>
          </div>
        </div>
      )}

      {/* Indicateur de tracking */}
      {!isLoading && (
        <div
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
            transition: 'all 0.3s ease'
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
          transition: 'all 0.3s ease'
        }}
      >
        ← Retour
      </Link>

      {/* Scène MindAR Image Tracking - Configuration optimisée */}
      <a-scene
        mindar-image="imageTargetSrc: /composant/image-a-reconnaitre/personne.mind; filterMinCF: 0.001; filterBeta: 5; warmupTolerance: 3; missTolerance: 5; uiLoading: no; uiError: no; uiScanning: no; autoStart: true; maxTrack: 1;"
        vr-mode-ui="enabled: false"
        device-orientation-permission-ui="enabled: false"
        embedded
        renderer="colorManagement: true; physicallyCorrectLights: false;"
      >
        {/* Caméra selon la doc */}
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
          ></a-text>
        </a-entity>
      </a-scene>

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

        /* Styles spécifiques pour mobile - Forcer le plein écran */
        @media (max-width: 768px) {
          a-scene {
            width: 100vw !important;
            height: 100vh !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            overflow: hidden !important;
          }

          a-scene video {
            width: 100vw !important;
            height: 100vh !important;
            min-width: 100vw !important;
            min-height: 100vh !important;
            max-width: 100vw !important;
            max-height: 100vh !important;
            object-fit: cover !important;
            object-position: center center !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            transform: none !important;
            /* Forcer le plein écran même si le ratio d'aspect est différent */
            z-index: 1 !important;
          }

          a-scene canvas {
            width: 100vw !important;
            height: 100vh !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MindARImagePage;
