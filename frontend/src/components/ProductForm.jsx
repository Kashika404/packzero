
import React, { useState } from 'react';
function ProductForm({ onProductSubmit }) {
  const [name, setName] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [isFragile, setIsFragile] = useState(false);
   const [quantity, setQuantity] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    
    const productData = {
      name,
      length: parseFloat(length),
      width: parseFloat(width),
      height: parseFloat(height),
      weight: parseFloat(weight),
      isFragile,
      quantity: parseInt(quantity, 10),
    };

    
    onProductSubmit(productData);

    
    setName(''); setLength(''); setWidth(''); setHeight(''); setWeight(''); setIsFragile(false);setQuantity('');
  };

 
  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Product Name"
        required
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
      />
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus-ring-blue-500 outline-none"
        />
        <input
          type="number"
          step="any"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="Weight (kg)"
          required
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>
      
      <div className="flex items-center gap-2">
        <input
          id="isFragile"
          type="checkbox"
          checked={isFragile}
          onChange={(e) => setIsFragile(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Quantity"
          required
          className="w-full p-2 border border-gray-300 rounded-md"
          min="0"
        />
        <label htmlFor="isFragile" className="text-sm font-medium text-gray-700">Is this item fragile?</label>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
      >
        Save Product
      </button>
    </form>
  );
}

export default ProductForm;