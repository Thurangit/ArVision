import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';

const MindARImagePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Obtenir le flux vidéo de la caméra avec l'API native
  useEffect(() => {
    const getCameraStream = async () => {
      try {
        // Demander l'accès à la caméra
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'environment' // Caméra arrière sur mobile
          },
          audio: false
        });

        streamRef.current = stream;

        // Attendre que la vidéo soit prête
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().then(() => {
            console.log('✅ Caméra activée avec succès');
            setIsLoading(false);
          }).catch(err => {
            // Ignorer les erreurs AbortError (normales en mode dev React)
            if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
              console.error('❌ Erreur lors de la lecture de la vidéo:', err);
              setCameraError('Impossible de lire le flux vidéo');
            }
            setIsLoading(false);
          });
        }
      } catch (error) {
        console.error('❌ Erreur d\'accès à la caméra:', error);
        setCameraError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
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

      {/* Message d'erreur caméra */}
      {cameraError && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10001,
            padding: '20px',
            backgroundColor: 'rgba(220, 38, 38, 0.9)',
            color: 'white',
            borderRadius: '10px',
            textAlign: 'center',
            maxWidth: '90%'
          }}
        >
          <div style={{ fontSize: '1.2em', marginBottom: '10px' }}>❌ Erreur</div>
          <div>{cameraError}</div>
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
