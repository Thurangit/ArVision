import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';

const MindARImagePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const sceneRef = useRef(null);

  useEffect(() => {
    // Vérifier que A-Frame est chargé
    if (typeof window === 'undefined' || !window.AFRAME) {
      console.error('A-Frame n\'est pas chargé');
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

      sceneRef.current = scene;

      // Écouter les événements MindAR (noms d'événements selon la doc MindAR)
      scene.addEventListener('arReady', () => {
        console.log('MindAR Image Tracking prêt');
        setIsLoading(false);
      });

      scene.addEventListener('arError', (event) => {
        console.error('Erreur MindAR:', event);
        setIsLoading(false);
      });

      // Écouter les événements de tracking via l'entité
      const targetEntity = scene.querySelector('[mindar-image-target]');
      if (targetEntity) {
        targetEntity.addEventListener('targetFound', () => {
          console.log('Image détectée');
          setIsTracking(true);
        });

        targetEntity.addEventListener('targetLost', () => {
          console.log('Image perdue');
          setIsTracking(false);
        });
      }

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
        scene.removeEventListener('arReady', () => {});
        scene.removeEventListener('arError', () => {});
      }
      const targetEntity = document.querySelector('[mindar-image-target]');
      if (targetEntity) {
        targetEntity.removeEventListener('targetFound', () => {});
        targetEntity.removeEventListener('targetLost', () => {});
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

      {/* Scène MindAR Image Tracking */}
      {typeof window !== 'undefined' && window.AFRAME && (
        <a-scene
          mindar-image="imageTargetSrc: /composant/image-a-reconnaitre/personne.mind;"
          vr-mode-ui="enabled: false"
          device-orientation-permission-ui="enabled: false"
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

          {/* Entity pour le tracking d'image - targetIndex: 0 pour la première image */}
          <a-entity mindar-image-target="targetIndex: 0">
            {/* Plan bleu pour overlay l'image (selon la doc) */}
            <a-plane 
              color="blue" 
              opacity="0.5" 
              position="0 0 0" 
              height="0.552" 
              width="1" 
              rotation="0 0 0"
            ></a-plane>

            {/* Contenu 3D à afficher au-dessus de l'image */}
            <a-box
              position="0 0.5 0"
              rotation="0 45 0"
              color="#4CC3D9"
              scale="0.5 0.5 0.5"
              animation="property: rotation; to: 0 405 0; loop: true; dur: 10000"
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

export default MindARImagePage;

