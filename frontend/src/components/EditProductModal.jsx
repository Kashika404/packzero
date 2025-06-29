
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext';

function EditProductModal({ product, isOpen, onClose, onProductUpdated }) {

  const [formData, setFormData] = useState({ ...product });
  const { api } = useAuth();

  useEffect(() => {
  
    if (product) {
      setFormData({ ...product });
    }
  }, [product]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
     
      const dataToSubmit = {
        name: formData.name,
        length: parseFloat(formData.length),
        width: parseFloat(formData.width),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        isFragile: formData.isFragile,
        
        quantity: parseInt(formData.quantity, 10),
      };

     

       await api.put(`/products/${product.id}`, dataToSubmit);
      toast.success('Product updated successfully!');
      onProductUpdated(); 
      onClose(); 
    } catch (error) {
      toast.error('Failed to update product.');
    }
  };

  return (
   
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Edit Product</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
         
          <input
            type="text"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          />
          
        
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="number"
              step="any"
              name="length"
              value={formData.length || ''}
              onChange={handleChange}
              placeholder="Length"
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="number"
              step="any"
              name="width"
              value={formData.width || ''}
              onChange={handleChange}
              placeholder="Width"
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="number"
              step="any"
              name="height"
              value={formData.height || ''}
              onChange={handleChange}
              placeholder="Height"
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="number"
              step="any"
              name="weight"
              value={formData.weight || ''}
              onChange={handleChange}
              placeholder="Weight"
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
        type="number"
        name="quantity"
        value={formData.quantity || ''}
        onChange={handleChange}
        placeholder="Quantity"
        required
        className="w-full p-2 border border-gray-300 rounded-md"
    />
          </div>

          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isFragile"
              id="isFragileEdit"
              checked={formData.isFragile || false}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isFragileEdit" className="text-sm font-medium text-gray-700">Is Fragile?</label>
          </div>

     
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProductModal;