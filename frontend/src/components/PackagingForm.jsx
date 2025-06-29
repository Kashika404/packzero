import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext'

function PackagingForm({ onPackagingCreated }) {
    const { api } = useAuth(); 
  const [name, setName] = useState(''); 
  const [type, setType] = useState('BOX'); 
  const [length, setLength] = useState(''); 
  const [width, setWidth] = useState(''); 
  const [height, setHeight] = useState(''); 
  const [maxWeight, setMaxWeight] = useState(''); 
  const [cost, setCost] = useState(''); 
    const [packagingWeight, setPackagingWeight] = useState(''); 
    const [quantity, setQuantity] = useState('');

  const handleSubmit = async (event) => { 
    event.preventDefault(); 
    const packagingData = { 
      name, 
      type, 
      length: parseFloat(length), 
      width: parseFloat(width), 
      height: parseFloat(height), 
      maxWeight: parseFloat(maxWeight),
      cost: parseFloat(cost), 
      packagingWeight: parseFloat(packagingWeight), 
       quantity: parseInt(quantity, 10),
    };
    
    try {
      await api.post('/packaging', packagingData);
      toast.success('Packaging created successfully!');
      setName(''); setType('BOX'); setLength(''); setWidth(''); setHeight(''); setMaxWeight(''); setCost('');setPackagingWeight(''); setQuantity('');
      onPackagingCreated();
       
    } catch (error) {
      
      console.error("Detailed error creating packaging:", error);

      if (error.response) {
       
        console.error("Backend Response Data:", error.response.data);
        const serverMessage = error.response.data?.message || 'An unknown server error occurred.';
        const details = error.response.data?.details ? JSON.stringify(error.response.data.details) : '';
        toast.error(`Error: ${serverMessage} ${details}`);
      } else if (error.request) {
        
        console.error("No response received from server. Is the backend running on port 8890?", error.request);
        toast.error('Failed to connect to the server. Please ensure the backend is running.');
      } else {
       
        console.error('Error setting up the request:', error.message);
        toast.error('A frontend error occurred before the request was sent.');
      }
      
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Packaging Name"
        required
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        required
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white"
      >
        <option value="BOX">Box</option>
        <option value="MAILER">Mailer</option>
      </select>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="number"
          step="any"
          value={length}
          onChange={(e) => setLength(e.target.value)}
          placeholder="Length (cm)"
          required
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <input
          type="number"
          step="any"
          value={width}
          onChange={(e) => setWidth(e.target.value)}
          placeholder="Width (cm)"
          required
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <input
          type="number"
          step="any"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          placeholder="Height (cm)"
          required
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <input
          type="number"
          step="any"
          value={maxWeight}
          onChange={(e) => setMaxWeight(e.target.value)}
          placeholder="Max Weight (kg)"
          required
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <input
          type="number"
          step="0.01"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          placeholder="Cost (e.g., 10.50)"
          required
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <input
  type="number"
  step="any"
  value={packagingWeight} 
  onChange={(e) => setPackagingWeight(e.target.value)}
  placeholder="Packaging Weight (kg)"
  required
  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
/>
<input
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        placeholder="Stock Quantity"
        required
        className="w-full p-2 border border-gray-300 rounded-md"
      />
      </div>
      
      <button
        type="submit"
        className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
      >
        Save Packaging
      </button>
    </form>
  );
}

export default PackagingForm;


