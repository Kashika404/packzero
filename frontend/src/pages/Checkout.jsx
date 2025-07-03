
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import RecommendationModal from '../components/RecommendationModal';

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { api } = useAuth();
  const { cart } = location.state || { cart: [] }; // Get cart from navigation state

  const [packagingPreference, setPackagingPreference] = useState('eco'); // Default to eco-friendly
  const [recommendationResult, setRecommendationResult] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Hardcoded addresses for the demo
  const fromAddress = { name: "PackZero Warehouse", street1: "215 Clayton St.", city: "San Francisco", state: "CA", zip: "94117", country: "US" };
  const toAddress = { name: "Valued Customer", street1: "123 Main St.", city: "New York", state: "NY", zip: "10001", country: "US" };

  if (cart.length === 0) {
    return (
      <div className="text-center p-10">
        <h2 className="text-2xl font-bold">Your cart is empty.</h2>
        <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    try {
      const productIds = cart.map(p => p.id);
      const response = await api.post('/recommend', {
        productIds,
        packagingPreference,
      });
      setRecommendationResult({ ...response.data, cart });
      setIsModalOpen(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not get recommendation.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">Customer Checkout</h1>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Your Order</h2>
            <ul className="divide-y divide-gray-200">
              {cart.map(item => (
                <li key={item.id} className="py-2 flex justify-between">
                  <span>{item.name}</span>
                  <span className="font-semibold">${(Math.random() * 50 + 10).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Packaging Options</h2>
            <div className="space-y-3">
              <label className="flex items-center p-4 border rounded-lg cursor-pointer has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500">
                <input type="radio" name="packaging" value="eco" checked={packagingPreference === 'eco'} onChange={(e) => setPackagingPreference(e.target.value)} className="h-5 w-5 text-blue-600" />
                <div className="ml-4">
                  <p className="font-bold">Eco-Friendly Packaging 🌳</p>
                  <p className="text-sm text-gray-600">We'll use the smallest box(es) possible to minimize waste.</p>
                </div>
              </label>
              <label className="flex items-center p-4 border rounded-lg cursor-pointer has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500">
                <input type="radio" name="packaging" value="standard" checked={packagingPreference === 'standard'} onChange={(e) => setPackagingPreference(e.target.value)} className="h-5 w-5 text-blue-600" />
                <div className="ml-4">
                  <p className="font-bold">Standard Packaging</p>
                  <p className="text-sm text-gray-600">We'll prioritize getting your order into a single box.</p>
                </div>
              </label>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={isLoading}
            className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
          >
            {isLoading ? 'Processing...' : 'Place Order & Get Recommendation'}
          </button>
        </div>
      </div>
      
      {/* Re-use the existing RecommendationModal */}
      <RecommendationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        results={recommendationResult}
        fromAddress={fromAddress}
        toAddress={toAddress}
      />
    </>
  );
}

export default Checkout;
