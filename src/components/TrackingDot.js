import React from 'react';

/**
 * Composant pour afficher un petit point de tracking
 * Gris quand aucune image n'est détectée, vert quand une image est détectée
 * Positionné en haut à droite de l'écran
 */
const TrackingDot = ({ isTracking }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: '15px',
        right: '15px',
        zIndex: 10000,
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: isTracking ? '#4CAF50' : '#9E9E9E',
        boxShadow: isTracking 
          ? '0 0 4px rgba(76, 175, 80, 0.5), 0 0 8px rgba(76, 175, 80, 0.3)' 
          : '0 0 2px rgba(158, 158, 158, 0.2)',
        transition: 'all 0.3s ease',
        pointerEvents: 'none',
        userSelect: 'none'
      }}
      aria-label={isTracking ? 'Image détectée' : 'Recherche d\'image'}
    />
  );
};

export default TrackingDot;

