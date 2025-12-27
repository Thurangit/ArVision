/**
 * Service de reconnaissance d'images utilisant les fichiers de descripteurs
 * Fichiers supportés: .fset, .fset3, .iset
 */

class ImageRecognitionService {
  constructor() {
    // Seuil de similarité par défaut (60%)
    this.defaultSimilarityThreshold = 0.6;
    
    // Images disponibles avec leurs descripteurs
    this.availableImages = {
      logoGifty144x144: {
        name: 'logoGifty144x144',
        displayName: 'Logo Gifty 144x144',
        fset: '/composant/image-a-reconnaitre/logoGifty144x144.fset',
        fset3: '/composant/image-a-reconnaitre/logoGifty144x144.fset3',
        iset: '/composant/image-a-reconnaitre/logoGifty144x144.iset'
      },
      th: {
        name: 'th',
        displayName: 'Image TH',
        fset: '/composant/image-a-reconnaitre/th.fset',
        fset3: '/composant/image-a-reconnaitre/th.fset3',
        iset: '/composant/image-a-reconnaitre/th.iset'
      },
      personne: {
        name: 'personne',
        displayName: 'Image Personne',
        fset: '/composant/image-a-reconnaitre/personne.fset',
        fset3: '/composant/image-a-reconnaitre/personne.fset3',
        iset: '/composant/image-a-reconnaitre/personne.iset'
      }
    };
    
    // Compatibilité avec l'ancien code
    this.descriptorFiles = this.availableImages.logoGifty144x144;
    this.loadedDescriptors = {};
  }

  /**
   * Charge un fichier de descripteur
   * @param {string} imageName - Nom de l'image ('logoGifty144x144' ou 'th')
   * @param {string} type - Type de descripteur ('fset', 'fset3', 'iset')
   * @returns {Promise<ArrayBuffer>}
   */
  async loadDescriptor(imageName = 'logoGifty144x144', type = 'fset') {
    try {
      const key = `${imageName}_${type}`;
      if (this.loadedDescriptors[key]) {
        return this.loadedDescriptors[key];
      }

      const image = this.availableImages[imageName];
      if (!image) {
        throw new Error(`Image ${imageName} non trouvée`);
      }

      const response = await fetch(image[type]);
      if (!response.ok) {
        throw new Error(`Impossible de charger le descripteur ${type} pour ${imageName}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      this.loadedDescriptors[key] = arrayBuffer;
      
      return arrayBuffer;
    } catch (error) {
      console.error(`Erreur lors du chargement du descripteur ${type} pour ${imageName}:`, error);
      throw error;
    }
  }

  /**
   * Charge tous les descripteurs disponibles pour une image
   * @param {string} imageName - Nom de l'image
   * @returns {Promise<Object>}
   */
  async loadAllDescriptors(imageName = 'logoGifty144x144') {
    const descriptors = {};
    const image = this.availableImages[imageName];
    
    if (!image) {
      throw new Error(`Image ${imageName} non trouvée`);
    }
    
    for (const type of ['fset', 'fset3', 'iset']) {
      try {
        descriptors[type] = await this.loadDescriptor(imageName, type);
      } catch (error) {
        console.warn(`Descripteur ${type} non disponible pour ${imageName}:`, error);
      }
    }
    
    return descriptors;
  }

  /**
   * Obtient la liste de toutes les images disponibles
   * @returns {Array}
   */
  getAvailableImages() {
    return Object.values(this.availableImages).map(img => ({
      name: img.name,
      displayName: img.displayName
    }));
  }

  /**
   * Convertit une image en ArrayBuffer pour traitement
   * @param {File|string} image - Fichier image ou URL
   * @returns {Promise<ArrayBuffer>}
   */
  async imageToArrayBuffer(image) {
    if (typeof image === 'string') {
      const response = await fetch(image);
      return await response.arrayBuffer();
    }
    
    return await image.arrayBuffer();
  }

  /**
   * Compare une image avec les descripteurs chargés
   * @param {File|string} image - Image à comparer
   * @param {string} imageName - Nom de l'image de référence
   * @param {string} descriptorType - Type de descripteur à utiliser
   * @param {number} similarityThreshold - Seuil de similarité (0-1), défaut: 0.7 (70%)
   * @returns {Promise<Object>} - Résultat de la comparaison
   */
  async recognizeImage(image, imageName = 'logoGifty144x144', descriptorType = 'fset', similarityThreshold = null) {
    try {
      // Utiliser le seuil fourni ou le seuil par défaut
      const threshold = similarityThreshold !== null ? similarityThreshold : this.defaultSimilarityThreshold;
      
      // Charger le descripteur de référence
      const descriptor = await this.loadDescriptor(imageName, descriptorType);
      
      // Convertir l'image en ArrayBuffer
      const imageBuffer = await this.imageToArrayBuffer(image);
      
      // Ici, vous pouvez implémenter la logique de comparaison réelle
      // avec une bibliothèque de reconnaissance d'images appropriée
      
      // Simulation de la comparaison
      const similarity = this.calculateSimilarity(descriptor, imageBuffer);
      
      return {
        success: true,
        similarity: similarity,
        imageName: imageName,
        descriptorType: descriptorType,
        threshold: threshold,
        match: similarity > threshold
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Définit le seuil de similarité par défaut
   * @param {number} threshold - Seuil de similarité (0-1)
   */
  setDefaultSimilarityThreshold(threshold) {
    if (threshold >= 0 && threshold <= 1) {
      this.defaultSimilarityThreshold = threshold;
    } else {
      console.warn('Le seuil de similarité doit être entre 0 et 1');
    }
  }

  /**
   * Obtient le seuil de similarité par défaut
   * @returns {number}
   */
  getDefaultSimilarityThreshold() {
    return this.defaultSimilarityThreshold;
  }

  /**
   * Calcule une similarité simulée entre deux buffers
   * Dans une implémentation réelle, cela utiliserait un algorithme de reconnaissance
   * @param {ArrayBuffer} descriptor1 
   * @param {ArrayBuffer} descriptor2 
   * @returns {number} - Score de similarité entre 0 et 1
   */
  calculateSimilarity(descriptor1, descriptor2) {
    // Simulation d'un calcul de similarité
    // Dans une vraie implémentation, cela utiliserait des algorithmes ML
    const size1 = descriptor1.byteLength;
    const size2 = descriptor2.byteLength;
    
    // Calcul basique basé sur la taille (simulation)
    const sizeDiff = Math.abs(size1 - size2) / Math.max(size1, size2);
    return Math.max(0, 1 - sizeDiff);
  }

  /**
   * Obtient les informations sur les descripteurs disponibles
   * @param {string} imageName - Nom de l'image (optionnel)
   * @returns {Object}
   */
  getDescriptorInfo(imageName = null) {
    if (imageName && this.availableImages[imageName]) {
      return {
        image: this.availableImages[imageName],
        available: ['fset', 'fset3', 'iset'],
        loaded: Object.keys(this.loadedDescriptors).filter(key => key.startsWith(imageName))
      };
    }
    
    return {
      availableImages: this.getAvailableImages(),
      allImages: this.availableImages,
      loaded: Object.keys(this.loadedDescriptors)
    };
  }
}

// Export d'une instance singleton
export default new ImageRecognitionService();

