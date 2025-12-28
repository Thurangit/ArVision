import React, { useEffect, useState, useRef } from 'react';
import TrackingDot from '../components/TrackingDot';
import ObjectInfoCard from '../components/ObjectInfoCard';
import FloatingMenuBar from '../components/FloatingMenuBar';
import { getObjectInfo } from '../data/arObjects';

const MindARImagePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [detectedObject, setDetectedObject] = useState(null); // Objet actuellement détecté
  const [cameraError, setCameraError] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const deferredPromptRef = useRef(null);

  // Mapping des fichiers .mind vers les objets
  const mindFileMapping = {
    'personne.mind': 'personne',
    'montre.mind': 'montre',
    'télé.mind': 'télé',
    'logosrouge.mind': 'logosrouge'
  };

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
        const currentVideo = videoRef.current;
        if (currentVideo) {
          currentVideo.srcObject = stream;
          currentVideo.play().then(() => {
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
      const currentStream = streamRef.current;
      const currentVideo = videoRef.current;

      if (currentStream) {
        currentStream.getTracks().forEach(track => {
          track.stop();
          console.log('📹 Piste vidéo arrêtée');
        });
        streamRef.current = null;
      }
      if (currentVideo) {
        currentVideo.srcObject = null;
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

    // Attendre que React ait rendu les scènes dans le DOM
    const initMindAR = () => {
      // Éviter les initialisations multiples
      if (isInitialized) {
        return;
      }

      const scenes = document.querySelectorAll('a-scene[mindar-image]');
      if (!scenes || scenes.length === 0) {
        if (initTimeout) clearTimeout(initTimeout);
        initTimeout = setTimeout(initMindAR, 100);
        return;
      }

      // Marquer comme initialisé
      isInitialized = true;
      console.log(`✅ ${scenes.length} scène(s) MindAR trouvée(s), initialisation...`);

      // Initialiser chaque scène
      scenes.forEach((scene) => {
        initScene(scene);
      });
    };

    // Fonction pour initialiser une scène individuelle
    const initScene = (scene) => {

      // Obtenir le système MindAR
      let arSystem = null;

      const sceneLoadedHandler = () => {
        arSystem = scene.systems && scene.systems["mindar-image-system"];
        if (arSystem) {
          const mindImageAttr = scene.getAttribute('mindar-image');
          const imageSrc = mindImageAttr?.imageTargetSrc || 'inconnu';
          console.log(`✅ Système MindAR chargé pour ${imageSrc}`);
          // Stocker le système pour le nettoyage
          scene._arSystem = arSystem;
        }
      };

      scene.addEventListener('loaded', sceneLoadedHandler);

      // Définir les handlers d'événements MindAR
      const arReadyHandler = () => {
        const mindImageAttr = scene.getAttribute('mindar-image');
        const imageSrc = mindImageAttr?.imageTargetSrc || 'inconnu';
        console.log(`✅ MindAR Image Tracking prêt pour ${imageSrc}`);
      };

      const arErrorHandler = (event) => {
        const mindImageAttr = scene.getAttribute('mindar-image');
        const imageSrc = mindImageAttr?.imageTargetSrc || 'inconnu';
        console.error(`❌ Erreur MindAR pour ${imageSrc}:`, event);
      };

      const mindLoadedHandler = () => {
        const mindImageAttr = scene.getAttribute('mindar-image');
        const imageSrc = mindImageAttr?.imageTargetSrc || 'inconnu';
        console.log(`📦 Fichier .mind chargé pour ${imageSrc}`);
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

      // Identifier l'objet associé à cette scène en fonction du fichier .mind
      const mindImageAttr = scene.getAttribute('mindar-image');
      let objectId = null;

      if (mindImageAttr && mindImageAttr.imageTargetSrc) {
        const imageSrc = mindImageAttr.imageTargetSrc;
        // Extraire le nom du fichier depuis le chemin
        const fileName = imageSrc.split('/').pop();
        // Trouver l'objet correspondant au fichier .mind
        objectId = mindFileMapping[fileName] || null;
        if (objectId) {
          console.log(`📋 Scène associée à l'objet: ${objectId} (fichier: ${fileName})`);
        }
      }

      // Stocker l'objectId sur la scène pour référence
      scene._objectId = objectId;

      // Écouter les événements de tracking pour toutes les entités de cette scène
      const targetEntities = scene.querySelectorAll('[mindar-image-target]');

      targetEntities.forEach((targetEntity) => {
        const targetFoundHandler = () => {
          console.log(`✅ Image détectée - ${objectId || 'inconnu'}`);
          setIsTracking(true);

          // Obtenir les informations de l'objet détecté
          if (objectId) {
            const objectInfo = getObjectInfo(objectId);
            if (objectInfo) {
              setDetectedObject(objectInfo);
            }
          }
        };

        const targetLostHandler = () => {
          console.log(`❌ Image perdue - ${objectId || 'inconnu'}`);
          // Vérifier si d'autres scènes ont encore des targets détectés
          setTimeout(() => {
            let anyActive = false;
            const allScenes = document.querySelectorAll('a-scene[mindar-image]');
            allScenes.forEach((otherScene) => {
              const otherTargets = otherScene.querySelectorAll('[mindar-image-target]');
              otherTargets.forEach((entity) => {
                if (entity.object3D && entity.object3D.visible) {
                  anyActive = true;
                }
              });
            });

            if (!anyActive) {
              setIsTracking(false);
              setDetectedObject(null);
            }
          }, 200);
        };

        targetEntity.addEventListener('targetFound', targetFoundHandler);
        targetEntity.addEventListener('targetLost', targetLostHandler);

        // Stocker les handlers pour le nettoyage
        targetEntity._targetFoundHandler = targetFoundHandler;
        targetEntity._targetLostHandler = targetLostHandler;
        targetEntity._objectId = objectId;
      });
    };

    // Démarrer l'initialisation après un court délai
    const timeout = setTimeout(() => {
      initMindAR();
    }, 1000);

    // Nettoyage
    return () => {
      if (initTimeout) clearTimeout(initTimeout);
      clearTimeout(timeout);

      const allScenes = document.querySelectorAll('a-scene[mindar-image]');
      allScenes.forEach((scene) => {
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
              console.log(`✅ MindAR arrêté proprement pour ${scene._objectId || 'scène inconnue'}`);
            } else {
              // Le système n'est pas complètement initialisé, on essaie juste de pause
              if (typeof arSystem.pause === 'function') {
                arSystem.pause();
                console.log(`✅ MindAR mis en pause pour ${scene._objectId || 'scène inconnue'}`);
              }
            }
          }
        } catch (error) {
          // Ignorer les erreurs silencieusement si le système n'est pas initialisé
          if (error.message && !error.message.includes('stopProcessVideo')) {
            console.warn(`⚠️ Erreur lors de l'arrêt de MindAR pour ${scene._objectId || 'scène inconnue'}:`, error);
          }
        }

        // Nettoyer les event listeners des targets
        const targetEntities = scene.querySelectorAll('[mindar-image-target]');
        targetEntities.forEach((targetEntity) => {
          if (targetEntity._targetFoundHandler) {
            targetEntity.removeEventListener('targetFound', targetEntity._targetFoundHandler);
          }
          if (targetEntity._targetLostHandler) {
            targetEntity.removeEventListener('targetLost', targetEntity._targetLostHandler);
          }
        });
      });

      isInitialized = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

      {/* Point de tracking (gris/vert en haut à droite) */}
      {!isLoading && !cameraError && (
        <TrackingDot isTracking={isTracking} />
      )}

      {/* Card d'information de l'objet détecté (en haut à gauche) */}
      {!isLoading && !cameraError && (
        <ObjectInfoCard
          objectInfo={detectedObject}
          isVisible={isTracking && detectedObject !== null}
        />
      )}

      {/* Barre de menu flottante (en bas) */}
      {!isLoading && !cameraError && (
        <FloatingMenuBar />
      )}

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

      {/* Scènes MindAR Image Tracking - Une scène par fichier .mind pour détecter toutes les images */}

      {/* Scène 1: Personne */}
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
        <a-entity mindar-image-target="targetIndex: 0"></a-entity>
      </a-scene>

      {/* Scène 2: Montre */}
      <a-scene
        mindar-image="imageTargetSrc: /composant/image-a-reconnaitre/montre.mind; filterMinCF: 0.001; filterBeta: 5; warmupTolerance: 3; missTolerance: 5; uiLoading: no; uiError: no; uiScanning: no; autoStart: true; maxTrack: 1;"
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
        <a-entity mindar-image-target="targetIndex: 0"></a-entity>
      </a-scene>

      {/* Scène 3: Télé */}
      <a-scene
        mindar-image="imageTargetSrc: /composant/image-a-reconnaitre/télé.mind; filterMinCF: 0.001; filterBeta: 5; warmupTolerance: 3; missTolerance: 5; uiLoading: no; uiError: no; uiScanning: no; autoStart: true; maxTrack: 1;"
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
        <a-entity mindar-image-target="targetIndex: 0"></a-entity>
      </a-scene>

      {/* Scène 4: Logo Rouge */}
      <a-scene
        mindar-image="imageTargetSrc: /composant/image-a-reconnaitre/logosrouge.mind; filterMinCF: 0.001; filterBeta: 5; warmupTolerance: 3; missTolerance: 5; uiLoading: no; uiError: no; uiScanning: no; autoStart: true; maxTrack: 1;"
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
        <a-entity mindar-image-target="targetIndex: 0"></a-entity>
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
