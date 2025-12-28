import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * Barre de menu flottante en bas de l'écran
 * Se rétracte en une seule icône après 3 secondes d'inactivité
 * Au clic, redevient la barre complète
 * Transparente avec effet glassmorphism
 */
const FloatingMenuBar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef(null);
  const navigate = useNavigate();

  // Réinitialiser le timer quand l'utilisateur interagit
  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Étendre la barre si elle est rétractée
    if (!isExpanded) {
      setIsExpanded(true);
    }

    // Programmer la rétraction après 3 secondes
    timeoutRef.current = setTimeout(() => {
      if (!isHovered) {
        setIsExpanded(false);
      }
    }, 3000);
  };

  useEffect(() => {
    // Démarrer le timer initial
    resetTimer();

    // Écouter les interactions utilisateur
    const handleInteraction = () => {
      resetTimer();
    };

    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    window.addEventListener('click', handleInteraction);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('click', handleInteraction);
    };
  }, [isExpanded, isHovered]);

  const handleMenuClick = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      resetTimer();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: isExpanded ? 'translateX(-50%)' : 'translateX(-50%)',
        zIndex: 10000,
        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}
      onMouseEnter={() => {
        setIsHovered(true);
        resetTimer();
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        resetTimer();
      }}
    >
      {isExpanded ? (
        // Barre de menu complète
        <div
          style={{
            display: 'flex',
            gap: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
            borderRadius: '30px',
            padding: '8px 12px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          {/* Bouton Retour */}
          <button
            onClick={() => navigate(-1)}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: 'white',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(8px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            aria-label="Retour"
          >
            ←
          </button>

          {/* Bouton Accueil */}
          <Link
            to="/"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: 'white',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(8px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            aria-label="Accueil"
          >
            ⌂
          </Link>

          {/* Bouton Notifications */}
          <button
            onClick={() => {
              // TODO: Implémenter les notifications
              console.log('Notifications');
            }}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: 'white',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(8px)',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            aria-label="Notifications"
          >
            ⚬
          </button>
        </div>
      ) : (
        // Icône de menu rétractée
        <button
          onClick={handleMenuClick}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white',
            fontSize: '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          aria-label="Menu"
        >
          ☰
        </button>
      )}
    </div>
  );
};

export default FloatingMenuBar;

