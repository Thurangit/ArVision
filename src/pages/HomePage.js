import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import imageRecognitionService from '../services/imageRecognitionService';

const HomePage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [recognitionStatus, setRecognitionStatus] = useState('');
  const [recognitionResult, setRecognitionResult] = useState(null);
  const [selectedDescriptor, setSelectedDescriptor] = useState('fset');
  const [descriptorsLoaded, setDescriptorsLoaded] = useState(false);
  const fileInputRef = useRef(null);

  // Charger les informations sur les descripteurs au montage
  useEffect(() => {
    const loadDescriptorInfo = async () => {
      try {
        const info = imageRecognitionService.getDescriptorInfo();
        setDescriptorsLoaded(true);
      } catch (error) {
        console.error('Erreur lors du chargement des descripteurs:', error);
      }
    };
    loadDescriptorInfo();
  }, []);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setRecognitionStatus('Image sélectionnée. Prêt pour la reconnaissance.');
    }
  };

  const handleImageRecognition = async () => {
    if (!selectedFile) {
      setRecognitionStatus('Veuillez sélectionner une image d\'abord.');
      return;
    }

    setRecognitionStatus('Traitement en cours...');
    setRecognitionResult(null);
    
    try {
      // Utiliser le service de reconnaissance d'images
      const result = await imageRecognitionService.recognizeImage(
        selectedFile,
        selectedDescriptor
      );
      
      if (result.success) {
        setRecognitionResult(result);
        const matchText = result.match 
          ? 'Image reconnue avec succès!' 
          : 'Image non reconnue (similarité insuffisante)';
        setRecognitionStatus(
          `${matchText} Similarité: ${(result.similarity * 100).toFixed(2)}%`
        );
      } else {
        setRecognitionStatus('Erreur lors de la reconnaissance: ' + result.error);
      }
    } catch (error) {
      setRecognitionStatus('Erreur lors de la reconnaissance: ' + error.message);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setRecognitionStatus('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            ArVision
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Système de reconnaissance d'images avec descripteurs
          </p>
          <p className="text-lg text-gray-500">
            Réalité Augmentée basée sur Image Tracking (NFT)
          </p>
        </div>

        {/* Section Réalité Augmentée */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-xl p-8 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-3">
                  🎯 Expérience de Réalité Augmentée
                </h2>
                <p className="text-lg mb-4 opacity-90">
                  Utilisez votre caméra pour scanner l'image logoGifty144x144 et voir du contenu 3D apparaître en réalité augmentée.
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm opacity-90">
                  <li>Tracking d'image en temps réel</li>
                  <li>Affichage de contenu 3D interactif</li>
                  <li>Stabilisation avancée avec smoothing</li>
                </ul>
              </div>
              <Link
                to="/ar"
                className="px-8 py-4 bg-white text-purple-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Lancer l'AR →
              </Link>
            </div>
          </div>
        </div>

        {/* Zone principale */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Fichiers de descripteurs disponibles
            </h2>
            
            <div className="space-y-6">
              {/* Image 1: logoGifty144x144 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Image 1: Logo Gifty 144x144</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="text-sm font-medium text-gray-500 mb-2">Format FSET</div>
                    <div className="text-lg font-semibold text-gray-800 mb-2">
                      logoGifty144x144.fset
                    </div>
                    <div className="text-xs text-gray-400">
                      Descripteur d'image principal
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="text-sm font-medium text-gray-500 mb-2">Format FSET3</div>
                    <div className="text-lg font-semibold text-gray-800 mb-2">
                      logoGifty144x144.fset3
                    </div>
                    <div className="text-xs text-gray-400">
                      Descripteur d'image version 3
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="text-sm font-medium text-gray-500 mb-2">Format ISET</div>
                    <div className="text-lg font-semibold text-gray-800 mb-2">
                      logoGifty144x144.iset
                    </div>
                    <div className="text-xs text-gray-400">
                      Descripteur d'image alternatif
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <Link
                    to="/ar?image=logoGifty144x144"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Tester cette image en AR →
                  </Link>
                </div>
              </div>

              {/* Image 2: th */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Image 2: Image TH</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="text-sm font-medium text-gray-500 mb-2">Format FSET</div>
                    <div className="text-lg font-semibold text-gray-800 mb-2">
                      th.fset
                    </div>
                    <div className="text-xs text-gray-400">
                      Descripteur d'image principal
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="text-sm font-medium text-gray-500 mb-2">Format FSET3</div>
                    <div className="text-lg font-semibold text-gray-800 mb-2">
                      th.fset3
                    </div>
                    <div className="text-xs text-gray-400">
                      Descripteur d'image version 3
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="text-sm font-medium text-gray-500 mb-2">Format ISET</div>
                    <div className="text-lg font-semibold text-gray-800 mb-2">
                      th.iset
                    </div>
                    <div className="text-xs text-gray-400">
                      Descripteur d'image alternatif
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <Link
                    to="/ar?image=th"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Tester cette image en AR →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Zone de téléchargement et reconnaissance */}
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Reconnaissance d'image
            </h2>

            <div className="space-y-6">
              {/* Sélection du type de descripteur */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de descripteur à utiliser
                </label>
                <select
                  value={selectedDescriptor}
                  onChange={(e) => setSelectedDescriptor(e.target.value)}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="fset">FSET (logoGifty144x144.fset)</option>
                  <option value="fset3">FSET3 (logoGifty144x144.fset3)</option>
                  <option value="iset">ISET (logoGifty144x144.iset)</option>
                </select>
              </div>

              {/* Sélection de fichier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sélectionner une image à reconnaître
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    cursor-pointer"
                />
              </div>

              {/* Aperçu de l'image */}
              {imagePreview && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Aperçu de l'image :
                  </div>
                  <div className="flex justify-center">
                    <img
                      src={imagePreview}
                      alt="Aperçu"
                      className="max-w-full max-h-64 rounded-lg shadow-md"
                    />
                  </div>
                </div>
              )}

              {/* Statut de la reconnaissance */}
              {recognitionStatus && (
                <div className={`p-4 rounded-lg ${
                  recognitionStatus.includes('Erreur')
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : recognitionStatus.includes('reconnue avec succès')
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  <div className="font-medium">{recognitionStatus}</div>
                </div>
              )}

              {/* Résultats détaillés */}
              {recognitionResult && recognitionResult.success && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Résultats détaillés :</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type de descripteur :</span>
                      <span className="font-medium text-gray-800">{recognitionResult.descriptorType.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Score de similarité :</span>
                      <span className="font-medium text-gray-800">
                        {(recognitionResult.similarity * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Correspondance :</span>
                      <span className={`font-medium ${
                        recognitionResult.match ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {recognitionResult.match ? '✓ Oui' : '✗ Non'}
                      </span>
                    </div>
                    {/* Barre de progression de la similarité */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            recognitionResult.match ? 'bg-green-500' : 'bg-yellow-500'
                          }`}
                          style={{ width: `${recognitionResult.similarity * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Boutons d'action */}
              <div className="flex gap-4">
                <button
                  onClick={handleImageRecognition}
                  disabled={!selectedFile}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                    selectedFile
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Lancer la reconnaissance
                </button>
                
                {selectedFile && (
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Navigation vers les autres pages */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/ar"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              🎯 Lancer la Réalité Augmentée
            </Link>
            <Link
              to="/test2"
              className="text-blue-600 hover:text-blue-800 underline font-medium"
            >
              Aller à la Page de Test 2
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

