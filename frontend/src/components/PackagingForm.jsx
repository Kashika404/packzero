// import React, { useState } from 'react';
// import axios from 'axios';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// function PackagingForm({ onPackagingCreated }) {
//   const [name, setName] = useState('');
//   const [type, setType] = useState('BOX');
//   const [length, setLength] = useState('');
//   const [width, setWidth] = useState('');
//   const [height, setHeight] = useState('');
//   const [maxWeight, setMaxWeight] = useState('');
//   const [cost, setCost] = useState(''); 

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     const packagingData = {
//       name,
//       type,
//       length: parseFloat(length),
//       width: parseFloat(width),
//       height: parseFloat(height),
//       maxWeight: parseFloat(maxWeight),
//        cost: parseFloat(cost),
//     };


// try {
//       await axios.post('http://localhost:8888/api/packaging', packagingData);
//       toast.success('Packaging created successfully!');
//       // Clear form
//       setName(''); setType('BOX'); setLength(''); setWidth(''); setHeight(''); setMaxWeight(''); setCost('');
//       onPackagingCreated();
//     } catch (error) {
//       toast.error('Failed to create packaging.');
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Packaging Name" required />
//       <select value={type} onChange={(e) => setType(e.target.value)} required>
//         <option value="BOX">Box</option>
//         <option value="MAILER">Mailer</option>
//       </select>
//       {/* Ensure EVERY input that needs a value has the 'required' attribute */}
//       <input type="number" value={length} onChange={(e) => setLength(e.target.value)} placeholder="Length (cm)" required />
//       <input type="number" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="Width (cm)" required />
//       <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="Height (cm)" required />
//       <input type="number" value={maxWeight} onChange={(e) => setMaxWeight(e.target.value)} placeholder="Max Weight (kg)" required />
//       <input type="number" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="Cost (e.g., 10.50)" required />
//       <button type="submit">Save Packaging</button>
//     </form>
//   );
// }

// export default PackagingForm;




import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function PackagingForm({ onPackagingCreated }) {
  const [name, setName] = useState(''); //
  const [type, setType] = useState('BOX'); //
  const [length, setLength] = useState(''); //
  const [width, setWidth] = useState(''); //
  const [height, setHeight] = useState(''); //
  const [maxWeight, setMaxWeight] = useState(''); //
  const [cost, setCost] = useState(''); //

  const handleSubmit = async (event) => { //
    event.preventDefault(); //
    const packagingData = { //
      name, //
      type, //
      length: parseFloat(length), //
      width: parseFloat(width), //
      height: parseFloat(height), //
      maxWeight: parseFloat(maxWeight), //
      cost: parseFloat(cost), //
    };


    try {
      await axios.post('http://localhost:8888/api/packaging', packagingData); //
      toast.success('Packaging created successfully!'); //
      // Clear form
      setName(''); setType('BOX'); setLength(''); setWidth(''); setHeight(''); setMaxWeight(''); setCost(''); //
      onPackagingCreated(); //
    } catch (error) {
      toast.error('Failed to create packaging.'); //
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