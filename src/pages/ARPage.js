import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import imageRecognitionService from '../services/imageRecognitionService';

const ARPage = () => {
  const [searchParams] = useSearchParams();
  const [selectedImage, setSelectedImage] = useState(
    searchParams.get('image') || 'logoGifty144x144'
  );
  const [availableImages, setAvailableImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [markerFound, setMarkerFound] = useState(false);

  useEffect(() => {
    // Charger la liste des images disponibles
    const images = imageRecognitionService.getAvailableImages();
    setAvailableImages(images);
  }, []);

  useEffect(() => {
    // Vérifier que A-Frame et AR.js sont chargés (depuis index.html)
    const checkAndInitialize = () => {
      if (!window.AFRAME) {
        console.error('A-Frame n\'est pas chargé. Vérifiez que le script est dans index.html');
        setIsLoading(false);
        return;
      }

      if (!window.ARjs) {
        console.error('AR.js n\'est pas chargé. Vérifiez que le script est dans index.html');
        setIsLoading(false);
        return;
      }

      // Attendre que le DOM soit prêt et que React ait rendu la scène
      setTimeout(() => {
        initializeAR();
      }, 1000);
    };

    const initializeAR = () => {
      let nftLoadedHandler = null;
      let markerFoundHandler = null;
      let markerLostHandler = null;
      let safetyTimeout = null;
      let sceneCheckInterval = null;

      // Fonction pour cacher le loader
      const hideLoader = () => {
        setIsLoading(false);
        console.log('Loader caché - AR prêt');
      };

      // Écouter l'événement de chargement des NFT markers
      nftLoadedHandler = () => {
        hideLoader();
        console.log('NFT Markers chargés avec succès');
      };

      // Écouter sur window ET document (au cas où)
      window.addEventListener('arjs-nft-loaded', nftLoadedHandler);
      document.addEventListener('arjs-nft-loaded', nftLoadedHandler);

      // Attendre que la scène soit dans le DOM
      sceneCheckInterval = setInterval(() => {
        const scene = document.querySelector('a-scene');
        if (scene) {
          clearInterval(sceneCheckInterval);
          
          // Écouter aussi sur la scène elle-même
          scene.addEventListener('arjs-nft-loaded', nftLoadedHandler);
          
          // Écouter les événements de tracking
          markerFoundHandler = () => {
            setMarkerFound(true);
            setIsTracking(true);
            console.log('Image détectée !');
          };

          markerLostHandler = () => {
            setMarkerFound(false);
            setIsTracking(false);
            console.log('Image perdue');
          };

          scene.addEventListener('markerFound', markerFoundHandler);
          scene.addEventListener('markerLost', markerLostHandler);

          // Vérifier périodiquement si la scène est prête et si la caméra est active
          const checkSceneReady = setInterval(() => {
            if (scene.hasLoaded && scene.isPlaying) {
              // Vérifier si la vidéo de la caméra est active (indique que l'AR est prêt)
              const video = document.querySelector('video');
              if (video && video.readyState >= 2 && !video.paused) {
                clearInterval(checkSceneReady);
                // La caméra est active, cacher le loader après un court délai
                setTimeout(() => {
                  hideLoader();
                }, 500);
              }
              
              // Alternative : vérifier si les descripteurs NFT sont chargés
              const arjsSystem = scene.systems['arjs'];
              if (arjsSystem && arjsSystem._arSession && arjsSystem._arSession.ready) {
                clearInterval(checkSceneReady);
                setTimeout(() => {
                  hideLoader();
                }, 500);
              }
            }
          }, 300);
          
          // Arrêter la vérification après 10 secondes et cacher le loader de toute façon
          setTimeout(() => {
            clearInterval(checkSceneReady);
            hideLoader();
          }, 10000);
        }
      }, 100);

      // Timeout de sécurité : cacher le loader après 5 secondes même si l'événement ne se déclenche pas
      // (la caméra devrait être ouverte à ce moment-là)
      safetyTimeout = setTimeout(() => {
        clearInterval(sceneCheckInterval);
        console.warn('Timeout de sécurité : masquage du loader après 5 secondes');
        hideLoader();
      }, 5000);

      // Nettoyage
      return () => {
        if (nftLoadedHandler) {
          window.removeEventListener('arjs-nft-loaded', nftLoadedHandler);
          document.removeEventListener('arjs-nft-loaded', nftLoadedHandler);
        }
        if (safetyTimeout) {
          clearTimeout(safetyTimeout);
        }
        if (sceneCheckInterval) {
          clearInterval(sceneCheckInterval);
        }
        const scene = document.querySelector('a-scene');
        if (scene) {
          if (nftLoadedHandler) {
            scene.removeEventListener('arjs-nft-loaded', nftLoadedHandler);
          }
          if (markerFoundHandler) {
            scene.removeEventListener('markerFound', markerFoundHandler);
          }
          if (markerLostHandler) {
            scene.removeEventListener('markerLost', markerLostHandler);
          }
        }
      };
    };

    // Attendre que les scripts soient chargés
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', checkAndInitialize);
    } else {
      checkAndInitialize();
    }

    // Le nettoyage est géré dans initializeAR
    return () => {
      // Nettoyage effectué dans initializeAR
    };
  }, [selectedImage]);

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
            <div>Chargement des descripteurs d'image...</div>
            <div style={{ fontSize: '0.9em', marginTop: '0.5em', opacity: 0.8 }}>
              Cela peut prendre quelques instants selon la puissance de votre appareil
            </div>
          </div>
        </div>
      )}

      {/* Sélecteur d'image */}
      {!isLoading && availableImages.length > 0 && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 10000,
            padding: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            borderRadius: '10px',
            minWidth: '200px'
          }}
        >
          <label style={{ color: 'white', fontSize: '12px', marginBottom: '5px', display: 'block' }}>
            Image à tracker :
          </label>
          <select
            value={selectedImage}
            onChange={(e) => {
              setSelectedImage(e.target.value);
              window.location.href = `/ar?image=${e.target.value}`;
            }}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '5px',
              border: 'none',
              backgroundColor: 'white',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            {availableImages.map((img) => (
              <option key={img.name} value={img.name}>
                {img.displayName}
              </option>
            ))}
          </select>
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
            backgroundColor: markerFound ? 'rgba(76, 175, 80, 0.9)' : 'rgba(255, 152, 0, 0.9)',
            color: 'white',
            borderRadius: '25px',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
            transition: 'all 0.3s ease'
          }}
        >
          {markerFound 
            ? '✓ Image détectée' 
            : `📷 Cherchez l'image ${availableImages.find(img => img.name === selectedImage)?.displayName || selectedImage}`
          }
        </div>
      )}

      {/* Instructions */}
      {!isLoading && !markerFound && (
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
            Pointez votre caméra vers l'image <strong>{availableImages.find(img => img.name === selectedImage)?.displayName || selectedImage}</strong> pour voir le contenu AR
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
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        }}
      >
        ← Retour
      </Link>

      {/* Scène A-Frame avec AR - Ne rendre que si A-Frame est chargé */}
      {typeof window !== 'undefined' && window.AFRAME && window.ARjs && (
        <a-scene
          vr-mode-ui="enabled: false"
          renderer="logarithmicDepthBuffer: true; colorManagement: true;"
          embedded
          arjs="trackingMethod: best; sourceType: webcam; debugUIEnabled: false;"
          style={{ 
            width: '100vw', 
            height: '100vh',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 1
          }}
          key={`scene-${selectedImage}`}
        >
        {/* NFT Marker - Image Tracking */}
        <a-nft
          type="nft"
          url={`/composant/image-a-reconnaitre/${selectedImage}`}
          smooth="true"
          smoothCount="10"
          smoothTolerance=".01"
          smoothThreshold="5"
          emitevents="true"
          size="1"
          key={selectedImage}
        >
          {/* Contenu 3D à afficher au-dessus de l'image */}
          
          {/* Exemple 1: Boîte colorée */}
          <a-box
            position="0 0.5 0"
            rotation="0 45 0"
            color="#4CC3D9"
            scale="0.5 0.5 0.5"
            animation="property: rotation; to: 0 405 0; loop: true; dur: 10000"
          ></a-box>

          {/* Exemple 2: Texte 3D */}
          <a-text
            value="ArVision"
            position="0 1.2 0"
            align="center"
            color="#FF6B6B"
            scale="2 2 2"
          ></a-text>

          {/* Exemple 3: Sphère animée */}
          <a-sphere
            position="-0.5 0.3 0"
            radius="0.2"
            color="#4ECDC4"
            animation="property: position; to: 0.5 0.3 0; loop: true; dur: 2000; easing: easeInOutQuad"
          ></a-sphere>

          {/* Exemple 4: Plan avec image ou vidéo (décommentez si vous avez un asset) */}
          {/* 
          <a-plane
            position="0 0.8 0"
            rotation="-90 0 0"
            width="1"
            height="1"
            src="#myImage"
          ></a-plane>
          */}

          {/* Exemple 5: Modèle GLTF (décommentez et ajoutez votre modèle) */}
          {/* 
          <a-entity
            gltf-model="/path-to-your-model.gltf"
            scale="0.5 0.5 0.5"
            position="0 0.5 0"
            rotation="0 0 0"
          ></a-entity>
          */}
        </a-nft>

         {/* Caméra statique */}
         <a-entity camera></a-entity>
       </a-scene>
       )}
       
       {/* Message si A-Frame n'est pas chargé */}
       {typeof window !== 'undefined' && (!window.AFRAME || !window.ARjs) && (
         <div style={{
           position: 'absolute',
           top: '50%',
           left: '50%',
           transform: 'translate(-50%, -50%)',
           zIndex: 10000,
           padding: '20px',
           backgroundColor: 'rgba(255, 0, 0, 0.9)',
           color: 'white',
           borderRadius: '10px',
           textAlign: 'center',
           maxWidth: '90%'
         }}>
           <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
             Erreur de chargement
           </div>
           <div>
             A-Frame ou AR.js ne sont pas chargés. Vérifiez votre connexion internet et rechargez la page.
           </div>
         </div>
       )}

      {/* Styles pour le loader et mobile */}
      <style>{`
        .arjs-loader {
          height: 100%;
          width: 100%;
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

        /* Styles pour mobile - s'assurer que la scène prend toute la place */
        @media (max-width: 768px) {
          a-scene {
            width: 100vw !important;
            height: 100vh !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            z-index: 1 !important;
          }

          a-scene video {
            width: 100vw !important;
            height: 100vh !important;
            object-fit: cover !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            transform: none !important;
          }

          a-scene canvas {
            width: 100vw !important;
            height: 100vh !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
          }
        }

        /* Empêcher le zoom sur mobile */
        * {
          touch-action: manipulation;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
        }
      `}</style>
    </div>
  );
};

export default ARPage;

