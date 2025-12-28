import React, { useEffect, useState } from 'react';

/**
 * Composant pour afficher une card avec le nom et l'histoire de l'objet détecté
 * S'affiche en haut à gauche avec une animation smooth
 * Contient une icône de point d'interrogation bien designée
 */
const ObjectInfoCard = ({ objectInfo, isVisible }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isVisible && objectInfo) {
      // Délai pour l'animation d'apparition
      setTimeout(() => setIsMounted(true), 100);
    } else {
      setIsMounted(false);
    }
  }, [isVisible, objectInfo]);

  if (!isVisible || !objectInfo) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '0px',
        zIndex: 10000,
        maxWidth: '200px',
        width: 'auto',
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: '12px 0 0 12px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        padding: '10px',
        transform: isMounted ? 'translateX(0) scale(1)' : 'translateX(100%) scale(0.8)',
        opacity: isMounted ? 1 : 0,
        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        pointerEvents: 'auto',
        overflow: 'hidden'
      }}
    >
      {/* En-tête avec icône et nom */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '10px',
          paddingBottom: '8px',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Icône de point d'interrogation stylisée */}
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            color: 'white',
            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
            flexShrink: 0
          }}
        >
          {objectInfo.icon || '❓'}
        </div>
        
        <div style={{ flex: 1 }}>
          <h3
            style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#1a1a1a',
              lineHeight: '1.2'
            }}
          >
            {objectInfo.name}
          </h3>
        </div>
      </div>

      {/* Histoire */}
      <div
        style={{
          fontSize: '10px',
          lineHeight: '1.5',
          color: '#4a4a4a',
          maxHeight: '300px',
          overflowY: 'auto',
          paddingRight: '4px',
          textAlign: 'left'
        }}
      >
        {objectInfo.story}
      </div>

      {/* Scrollbar personnalisée */}
      <style>{`
        div::-webkit-scrollbar {
          width: 6px;
        }
        div::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 3px;
        }
        div::-webkit-scrollbar-thumb {
          background: rgba(102, 126, 234, 0.5);
          border-radius: 3px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: rgba(102, 126, 234, 0.7);
        }
      `}</style>
    </div>
  );
};

export default ObjectInfoCard;

