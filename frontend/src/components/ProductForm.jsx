// import React, { useState } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// function ProductForm({ onProductCreated }) {
//   const [name, setName] = useState('');
//   const [length, setLength] = useState('');
//   const [width, setWidth] = useState('');
//   const [height, setHeight] = useState('');
//   const [weight, setWeight] = useState('');
//   const [isFragile, setIsFragile] = useState(false);

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     const productData = {
//       name: name,
//       length: parseFloat(length),
//       width: parseFloat(width),
//       height: parseFloat(height),
//       weight: parseFloat(weight),
//       isFragile: isFragile,
//     };

//     try {
//       await axios.post('http://localhost:8888/api/products', productData);
//       toast.success('Product created successfully!');
//       setName(''); setLength(''); setWidth(''); setHeight(''); setWeight(''); setIsFragile(false);
//       onProductCreated();
//     } catch (error) {
//       console.error("Full error response from backend:", error.response);
//       const detailedErrorMessage = error.response?.data?.exact_error || 'An unknown error occurred.';
//       toast.error(`Failed to create product.\n\nSERVER ERROR: ${detailedErrorMessage}`);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className='space-y-4'>
//       <input
//         type="text"
//         value={name}
//         onChange={(e) => setName(e.target.value)}
//         placeholder="Product Name"
//         required
//         className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
//       />
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <input
//           type="number"
//           step="any"
//           value={length}
//           onChange={(e) => setLength(e.target.value)}
//           placeholder="Length (cm)"
//           required
//           className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
//         />
//         <input
//           type="number"
//           step="any"
//           value={width}
//           onChange={(e) => setWidth(e.target.value)}
//           placeholder="Width (cm)"
//           required
//           className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
//         />
//         <input
//           type="number"
//           step="any"
//           value={height}
//           onChange={(e) => setHeight(e.target.value)}
//           placeholder="Height (cm)"
//           required
//           className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus-ring-blue-500 outline-none"
//         />
//         <input
//           type="number"
//           step="any"
//           value={weight}
//           onChange={(e) => setWeight(e.target.value)}
//           placeholder="Weight (kg)"
//           required
//           className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
//         />
//       </div>
      
//       <div className="flex items-center gap-2">
//         <input
//           id="isFragile"
//           type="checkbox"
//           checked={isFragile}
//           onChange={(e) => setIsFragile(e.target.checked)}
//           className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//         />
//         <label htmlFor="isFragile" className="text-sm font-medium text-gray-700">Is this item fragile?</label>
//       </div>

//       <button
//         type="submit"
//         className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
//       >
//         Save Product
//       </button>
//     </form>
//   );
// }

// export default ProductForm;


import React, { useState } from 'react';
// Note: axios and toast are no longer needed in this file.

// The component now takes a new prop, `onProductSubmit`, from App.jsx
function ProductForm({ onProductSubmit }) {
  const [name, setName] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [isFragile, setIsFragile] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    // 1. Package up all the form data into a single object
    const productData = {
      name,
      length: parseFloat(length),
      width: parseFloat(width),
      height: parseFloat(height),
      weight: parseFloat(weight),
      isFragile,
    };

    // 2. Call the function passed down from App.jsx, sending the data up
    onProductSubmit(productData);

    // 3. Clear the form fields for the next entry
    setName(''); setLength(''); setWidth(''); setHeight(''); setWeight(''); setIsFragile(false);
  };

  // The styled JSX for the form remains the same
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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