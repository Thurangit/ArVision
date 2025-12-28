import React from 'react';
import { Link } from 'react-router-dom';
import InstallButton from '../components/InstallButton';

const MainPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-gray-800 mb-4">
            ArVision
          </h1>
          <p className="text-2xl text-gray-600 mb-2">
            Réalité Augmentée avec MindAR
          </p>
          <p className="text-lg text-gray-500 mb-6">
            Image Tracking & Face Tracking
          </p>
          
          {/* Bouton d'installation PWA */}
          <div className="max-w-md mx-auto mb-8">
            <InstallButton />
          </div>
        </div>

        {/* Cartes principales */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Image Tracking */}
          <div className="bg-white rounded-xl shadow-2xl p-8 hover:shadow-3xl transition-all transform hover:scale-105">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-3">
                Image Tracking
              </h2>
              <p className="text-gray-600 mb-6">
                Scannez une image et voyez du contenu 3D apparaître en réalité augmentée
              </p>
            </div>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 mb-6">
              <li>Tracking d'image en temps réel</li>
              <li>Contenu 3D interactif</li>
              <li>Stable et performant</li>
              <li>Fonctionne sur mobile et desktop</li>
            </ul>
            <Link
              to="/mindar-image"
              className="block w-full text-center px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              🚀 Lancer Image Tracking
            </Link>
          </div>

          {/* Face Tracking */}
          <div className="bg-white rounded-xl shadow-2xl p-8 hover:shadow-3xl transition-all transform hover:scale-105">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">😊</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-3">
                Face Tracking
              </h2>
              <p className="text-gray-600 mb-6">
                Détectez votre visage et appliquez des effets AR en temps réel
              </p>
            </div>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 mb-6">
              <li>Détection faciale en temps réel</li>
              <li>Effets AR sur le visage</li>
              <li>Filtres et animations</li>
              <li>Optimisé pour mobile</li>
            </ul>
            <Link
              to="/mindar-face"
              className="block w-full text-center px-6 py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg font-semibold hover:from-pink-700 hover:to-rose-700 transition-all shadow-lg hover:shadow-xl"
            >
              🚀 Lancer Face Tracking
            </Link>
          </div>
        </div>

        {/* Section pages secondaires */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="bg-white rounded-xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
              Pages Secondaires (AR.js - Ancien système)
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              Accédez aux fonctionnalités de l'ancien système AR.js
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/legacy/home"
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-center font-medium text-gray-700 transition-colors"
              >
                Page d'accueil
              </Link>
              <Link
                to="/legacy/ar"
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-center font-medium text-gray-700 transition-colors"
              >
                AR.js Image Tracking
              </Link>
              <Link
                to="/legacy/test1"
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-center font-medium text-gray-700 transition-colors"
              >
                Page Test 1
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;

