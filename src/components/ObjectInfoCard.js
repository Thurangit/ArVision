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
        left: '20px',
        zIndex: 10000,
        maxWidth: '320px',
        width: 'calc(100vw - 40px)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        padding: '20px',
        transform: isMounted ? 'translateX(0) scale(1)' : 'translateX(-100%) scale(0.8)',
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
          gap: '12px',
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '2px solid rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Icône de point d'interrogation stylisée */}
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: 'white',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
            flexShrink: 0
          }}
        >
          {objectInfo.icon || '❓'}
        </div>
        
        <div style={{ flex: 1 }}>
          <h3
            style={{
              margin: 0,
              fontSize: '20px',
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
          fontSize: '13px',
          lineHeight: '1.6',
          color: '#4a4a4a',
          maxHeight: '400px',
          overflowY: 'auto',
          paddingRight: '8px',
          textAlign: 'justify'
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

