import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const MindARFacePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    // Charger MindAR Face Tracking dynamiquement
    const loadMindARFace = () => {
      return new Promise((resolve, reject) => {
        // Vérifier si MindAR Face est déjà chargé
        if (window.MINDAR && window.MINDAR.FaceTracking) {
          resolve();
          return;
        }

        // Charger le script MindAR Face Tracking
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mind-ar@1.2.2/dist/mindar-face-aframe.prod.js';
        script.onload = () => {
          console.log('✅ MindAR Face Tracking chargé');
          resolve();
        };
        script.onerror = () => {
          console.error('❌ Erreur lors du chargement de MindAR Face Tracking');
          reject(new Error('Impossible de charger MindAR Face Tracking'));
        };
        document.head.appendChild(script);
      });
    };

    // Vérifier que A-Frame est chargé et charger MindAR Face
    const initialize = async () => {
      if (typeof window === 'undefined' || !window.AFRAME) {
        console.error('A-Frame n\'est pas chargé');
        setIsLoading(false);
        return;
      }

      try {
        await loadMindARFace();
      } catch (error) {
        console.error('Erreur lors du chargement de MindAR Face:', error);
        setIsLoading(false);
        return;
      }

      // Attendre que le DOM soit prêt
      const initMindAR = () => {
        const scene = document.querySelector('a-scene');
        if (!scene) {
          setTimeout(initMindAR, 100);
          return;
        }

        // Écouter les événements MindAR Face Tracking
        const arReadyHandler = () => {
          console.log('✅ MindAR Face Tracking prêt');
          setIsLoading(false);
        };

        const arErrorHandler = (event) => {
          console.error('❌ Erreur MindAR Face Tracking:', event);
          setIsLoading(false);
        };

        scene.addEventListener('arReady', arReadyHandler);
        scene.addEventListener('arError', arErrorHandler);

        // Stocker les handlers pour le nettoyage
        scene._arReadyHandler = arReadyHandler;
        scene._arErrorHandler = arErrorHandler;

        // Écouter les événements de tracking via l'entité
        const faceTarget = scene.querySelector('[mindar-face-target]');
        if (faceTarget) {
          const targetFoundHandler = () => {
            console.log('✅ Visage détecté');
            setIsTracking(true);
          };

          const targetLostHandler = () => {
            console.log('❌ Visage perdu');
            setIsTracking(false);
          };

          faceTarget.addEventListener('targetFound', targetFoundHandler);
          faceTarget.addEventListener('targetLost', targetLostHandler);

          // Stocker les handlers pour le nettoyage
          faceTarget._targetFoundHandler = targetFoundHandler;
          faceTarget._targetLostHandler = targetLostHandler;
        }

        // Timeout de sécurité
        setTimeout(() => {
          setIsLoading(false);
        }, 5000);
      };

      setTimeout(initMindAR, 1000);
    };

    initialize();

    // Nettoyage
    return () => {
      const scene = document.querySelector('a-scene');
      if (scene) {
        if (scene._arReadyHandler) {
          scene.removeEventListener('arReady', scene._arReadyHandler);
        }
        if (scene._arErrorHandler) {
          scene.removeEventListener('arError', scene._arErrorHandler);
        }
      }

      const faceTarget = document.querySelector('[mindar-face-target]');
      if (faceTarget) {
        if (faceTarget._targetFoundHandler) {
          faceTarget.removeEventListener('targetFound', faceTarget._targetFoundHandler);
        }
        if (faceTarget._targetLostHandler) {
          faceTarget.removeEventListener('targetLost', faceTarget._targetLostHandler);
        }
      }

      // Arrêter MindAR Face Tracking
      try {
        const arSystem = scene && scene.systems && scene.systems["mindar-face-system"];
        if (arSystem && typeof arSystem.stop === 'function') {
          arSystem.stop();
          console.log('✅ MindAR Face Tracking arrêté proprement');
        }
      } catch (error) {
        console.warn('⚠️ Erreur lors de l\'arrêt de MindAR Face Tracking:', error);
      }

      // Arrêter tous les streams vidéo
      const video = scene && scene.querySelector('video');
      if (video && video.srcObject) {
        const stream = video.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => {
          track.stop();
          console.log('📹 Piste vidéo arrêtée');
        });
        video.srcObject = null;
      }
    };
  }, []);

  return (
    <div className="ar-page-container" style={{ 
      margin: 0, 
      padding: 0,
      overflow: 'hidden', 
      width: '100vw',
      height: '100vh', 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    }}>
      {/* Loader */}
      {isLoading && (
        <div className="arjs-loader">
          <div>
            <div style={{ fontSize: '1.5em', marginBottom: '1em' }}>⏳</div>
            <div>Chargement MindAR Face Tracking...</div>
            <div style={{ fontSize: '0.9em', marginTop: '0.5em', opacity: 0.8 }}>
              Autorisez l'accès à la caméra
            </div>
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
            ? '✓ Visage détecté' 
            : '📷 Pointez la caméra vers votre visage'
          }
        </div>
      )}

      {/* Instructions */}
      {!isLoading && !isTracking && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10000,
            padding: '15px 25px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            borderRadius: '10px',
            fontSize: '14px',
            textAlign: 'center',
            maxWidth: '90%'
          }}
        >
          <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
            Instructions :
          </div>
          <div>
            Pointez la caméra vers votre visage pour voir les effets AR
          </div>
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

      {/* Scène MindAR Face Tracking */}
      {typeof window !== 'undefined' && window.AFRAME && (
        <a-scene
          mindar-face="maxTrack: 1;"
          vr-mode-ui="enabled: false"
          renderer="colorManagement: true; physicallyCorrectLights: true;"
          embedded
          style={{ 
            width: '100vw', 
            height: '100vh',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 1
          }}
        >
          {/* Caméra */}
          <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>

          {/* Anchor pour le tracking facial */}
          <a-entity mindar-face-target="anchorIndex: 0">
            {/* Effets sur le visage */}
            <a-sphere
              position="0 0.2 0.1"
              radius="0.05"
              color="#FF6B6B"
              animation="property: scale; to: 1.5 1.5 1.5; loop: true; dur: 1000; easing: easeInOutQuad"
            ></a-sphere>

            <a-text
              value="Bonjour"
              position="0 0.3 0.1"
              align="center"
              color="#4ECDC4"
              scale="0.5 0.5 0.5"
            ></a-text>
          </a-entity>
        </a-scene>
      )}

      {/* Styles */}
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
      `}</style>
    </div>
  );
};

export default MindARFacePage;

