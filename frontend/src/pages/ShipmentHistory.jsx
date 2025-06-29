

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function ShipmentHistory() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const { api } = useAuth();

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const response = await api.get('/shipments');
        setShipments(response.data);
      } catch (error) {
        console.error("Failed to fetch shipment history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchShipments();
  }, [api]);

  if (loading) {
    return <div className="text-center p-10">Loading Shipment History...</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold leading-tight text-gray-900">Shipment History</h1>
          <Link to="/" className="text-blue-600 hover:underline">← Back to Dashboard</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="md:col-span-1 space-y-4">
            {shipments.length === 0 ? (
              <p>No shipment history found.</p>
            ) : (
              shipments.map(shipment => (
                <div
                  key={shipment.id}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${selectedShipment?.id === shipment.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white hover:bg-gray-100 shadow-md'}`}
                  onClick={() => setSelectedShipment(shipment)}
                >
                  <p className="font-bold">Shipment from: {new Date(shipment.createdAt).toLocaleDateString()}</p>
                  <p className="text-sm">Package: {shipment.recommendedPackaging?.name || 'N/A'}</p>
                  <p className="text-sm">{shipment.products.length} item(s)</p>
                </div>
              ))
            )}
          </div>

         
          <div className="md:col-span-2">
            {selectedShipment ? (
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Shipment Details</h2>
                <p><strong>Date:</strong> {new Date(selectedShipment.createdAt).toLocaleString()}</p>
                <p><strong>Package Used:</strong> {selectedShipment.recommendedPackaging?.name || 'N/A'}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
                    <div className="bg-blue-100 p-3 rounded-lg text-center">
                        <h4 className="font-semibold text-blue-800">Volume Saved</h4>
                        <p className="text-xl font-bold">{selectedShipment.volumeSaved} cm³</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg text-center">
                        <h4 className="font-semibold text-green-800">Cost Saved</h4>
                        <p className="text-xl font-bold">${selectedShipment.costSaved}</p>
                    </div>
                    <div className="bg-teal-100 p-3 rounded-lg text-center">
                        <h4 className="font-semibold text-teal-800">CO₂ Saved</h4>
                        <p className="text-xl font-bold">{selectedShipment.co2Saved} kg</p>
                    </div>
                </div>

                <h3 className="text-xl font-semibold mt-6 mb-2">Products in this Shipment:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {selectedShipment.products.map(product => (
                    <li key={product.id}>{product.name}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex items-center justify-center bg-white p-6 rounded-lg shadow-lg h-full">
                <p className="text-gray-500">Select a shipment from the left to view its details.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ShipmentHistory;