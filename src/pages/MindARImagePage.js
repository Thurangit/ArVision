import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';

const MindARImagePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const sceneRef = useRef(null);

  useEffect(() => {
    // Vérifier que A-Frame et MindAR sont chargés
    const checkLibraries = () => {
      if (typeof window === 'undefined') {
        return false;
      }
      
      // Vérifier A-Frame
      if (!window.AFRAME) {
        console.log('En attente d\'A-Frame...');
        return false;
      }

      // Vérifier que MindAR est disponible (via le composant mindar-image)
      const scene = document.querySelector('a-scene');
      if (scene && scene.hasAttribute('mindar-image')) {
        return true;
      }
      
      return false;
    };

    // Attendre que les bibliothèques soient chargées
    const waitForLibraries = setInterval(() => {
      if (checkLibraries()) {
        clearInterval(waitForLibraries);
        initMindAR();
      }
    }, 100);

    // Timeout de sécurité
    setTimeout(() => {
      clearInterval(waitForLibraries);
      if (!checkLibraries()) {
        console.error('MindAR ou A-Frame ne sont pas chargés');
        setIsLoading(false);
      } else {
        initMindAR();
      }
    }, 10000);

    const initMindAR = () => {
      const scene = document.querySelector('a-scene');
      if (!scene) {
        console.error('Scène A-Frame non trouvée');
        setIsLoading(false);
        return;
      }

      sceneRef.current = scene;

      // Écouter les événements MindAR
      const arReadyHandler = () => {
        console.log('✅ MindAR Image Tracking prêt - Caméra activée');
        setIsLoading(false);
        
        // Vérifier que la caméra vidéo est active
        const video = scene.querySelector('video');
        if (video) {
          console.log('📹 Caméra vidéo détectée:', video.readyState);
        }
      };

      const arErrorHandler = (event) => {
        console.error('❌ Erreur MindAR:', event);
        setIsLoading(false);
      };

      // Écouter aussi l'événement de chargement du fichier .mind
      const mindLoadedHandler = () => {
        console.log('📦 Fichier .mind chargé');
      };

      scene.addEventListener('arReady', arReadyHandler);
      scene.addEventListener('arError', arErrorHandler);
      scene.addEventListener('mindar-image-loaded', mindLoadedHandler);
      
      // Vérifier périodiquement si la caméra est active
      const checkCamera = setInterval(() => {
        const video = scene.querySelector('video');
        if (video && video.readyState >= 2) {
          console.log('📹 Caméra active détectée');
          clearInterval(checkCamera);
          setIsLoading(false);
        }
      }, 500);
      
      // Arrêter la vérification après 10 secondes
      setTimeout(() => {
        clearInterval(checkCamera);
      }, 10000);

      // Écouter les événements de tracking via l'entité
      const targetEntity = scene.querySelector('[mindar-image-target]');
      if (targetEntity) {
        const targetFoundHandler = () => {
          console.log('Image détectée');
          setIsTracking(true);
        };

        const targetLostHandler = () => {
          console.log('Image perdue');
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

      // Timeout de sécurité pour cacher le loader
      setTimeout(() => {
        setIsLoading(false);
      }, 5000);
    };

    // Nettoyage
    return () => {
      clearInterval(waitForLibraries);
      const scene = document.querySelector('a-scene');
      if (scene) {
        if (scene._arReadyHandler) {
          scene.removeEventListener('arReady', scene._arReadyHandler);
        }
        if (scene._arErrorHandler) {
          scene.removeEventListener('arError', scene._arErrorHandler);
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

      {/* Scène MindAR Image Tracking - Format exact selon la doc */}
      {typeof window !== 'undefined' && window.AFRAME && (
        <a-scene
          mindar-image="imageTargetSrc: /composant/image-a-reconnaitre/personne.mind;"
          vr-mode-ui="enabled: false"
          device-orientation-permission-ui="enabled: false"
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

