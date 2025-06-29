


import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Visualization from './Visualization';

function RecommendationModal({ isOpen, onClose, results, fromAddress, toAddress }) {
  const [rates, setRates] = useState([]);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPackageIndex, setSelectedPackageIndex] = useState(null);
  const [view, setView] = useState('rates');
  const { api } = useAuth();

  useEffect(() => {
    if (!isOpen) {
      setRates([]);
      setIsLoadingRates(false);
      setError(null);
      setSelectedPackageIndex(null);
      setView('rates'); 
    }
  }, [isOpen]);

  const fetchShippingRates = async (pkg, index) => {
    setSelectedPackageIndex(index); 
    setIsLoadingRates(true);
    setError(null);
    setRates([]);

    try {
      const response = await api.post('/shipping/rates', {
        package: pkg,
        fromAddress,
        toAddress
      });
      setRates(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch rates.");
    } finally {
      setIsLoadingRates(false);
    }
  };

  if (!isOpen || !results || !results.recommendedPackages) {
    return null;
  }
  
  const allProducts = results.cart;
   const selectedShipmentFor3D = results.recommendedPackages[selectedPackageIndex || 0];


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Packing & Shipping Recommendation</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
        </div>

        <div className="flex border-b mb-4">
            <button
                onClick={() => setView('rates')}
                className={`py-2 px-4 font-semibold ${view === 'rates' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
            >
                Shipping Rates
            </button>
            <button
                onClick={() => setView('3d')}
                className={`py-2 px-4 font-semibold ${view === '3d' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
            >
                3D View
            </button>
        </div>

      {view === 'rates' ? (

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">1. Your Packages</h3>
            {results.recommendedPackages.map((shipment, index) => {
               const productNames = shipment.containedProductIds.map(id => {
                    const product = allProducts.find(p => p.id === id);
                    return product ? product.name : 'Unknown';
                });
              return (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-blue-700">
                  Box {index + 1}: <span className="font-bold text-gray-900">{shipment.packaging.name}</span>
                </h4>
                <p className="text-sm text-gray-600">Contains: {productNames.join(', ')}</p>
                <button
                  onClick={() => fetchShippingRates(shipment.packaging, index)}
                  className="w-full mt-3 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
                  disabled={isLoadingRates}
                >
                  {isLoadingRates && selectedPackageIndex === index ? 'Fetching...' : `Get Rates for Box ${index + 1}`}
                </button>
              </div>
            )})}
            
            
          </div>

          
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">2. Shipping Rates</h3>
            {isLoadingRates && <p className="text-center p-4">Loading rates...</p>}
            {error && <p className="text-red-500 text-center p-4">{error}</p>}
            {rates.length > 0 ? (
              <ul className="space-y-2">
                {rates.map((rate, i) => (
                  <li key={i} className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm">
                    <div>
                      <p className="font-bold">{rate.provider} <span className="font-normal text-gray-600">{rate.service}</span></p>
                      <p className="text-sm text-gray-500">Est. {rate.estimatedDays} days</p>
                    </div>
                    <p className="text-lg font-bold text-green-600">${rate.amount}</p>
                  </li>
                ))}
              </ul>
            ) : (
              !isLoadingRates && !error && <p className="text-gray-500 text-center p-4">Click a "Get Rates" button to see shipping costs.</p>
            )}
          </div>
        </div>
      ):(
         
          <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  3D View for: {selectedShipmentFor3D.packaging.name}
              </h3>
              
              <Visualization shipment={selectedShipmentFor3D} />
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-semibold">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecommendationModal;
