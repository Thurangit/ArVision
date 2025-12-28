import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const MindARFacePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    // Vérifier que MindAR est chargé
    if (typeof window === 'undefined' || !window.AFRAME || !window.MINDAR) {
      console.error('MindAR n\'est pas chargé');
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
      scene.addEventListener('mindar-face-loaded', () => {
        console.log('MindAR Face Tracking chargé');
        setIsLoading(false);
      });

      scene.addEventListener('mindar-face-tracking-start', () => {
        console.log('Face Tracking démarré');
        setIsTracking(true);
      });

      scene.addEventListener('mindar-face-tracking-stop', () => {
        console.log('Face Tracking arrêté');
        setIsTracking(false);
      });

      // Timeout de sécurité
      setTimeout(() => {
        setIsLoading(false);
      }, 5000);
    };

    setTimeout(initMindAR, 1000);

    // Nettoyage
    return () => {
      const scene = document.querySelector('a-scene');
      if (scene) {
        scene.removeEventListener('mindar-face-loaded', () => {});
        scene.removeEventListener('mindar-face-tracking-start', () => {});
        scene.removeEventListener('mindar-face-tracking-stop', () => {});
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
      {typeof window !== 'undefined' && window.AFRAME && window.MINDAR && (
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

