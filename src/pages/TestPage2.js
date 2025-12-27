import React from 'react';
import { Link } from 'react-router-dom';

const TestPage2 = () => {
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-blue-800 mb-4">
          Page de Test 2
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Bienvenue sur la deuxième page de test de l'application ArVision.
        </p>
        <p className="text-base text-gray-500 mb-4">
          Cette page est accessible via la route /test2
        </p>
        <div className="mt-8">
          <Link 
            to="/test1" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Aller à la Page de Test 1
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TestPage2;

