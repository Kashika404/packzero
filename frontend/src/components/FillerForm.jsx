
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext'; 

function FillerForm({ onFillerCreated }) {
    const { api } = useAuth();
  const [name, setName] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    // try {
    //   await axios.post('http://localhost:8888/api/fillers', { name });
    //   toast.success('Filler created successfully!');
    //   setName('');
    //   onFillerCreated();
    // } catch (error) {
    //   toast.error('Failed to create filler.');
    // }
    try {
      // 3. Use the correct 'api' instance
      await api.post('/fillers', { name });
      toast.success('Filler created successfully!');
      setName('');
      onFillerCreated();
    } catch (error) {
      toast.error('Failed to create filler.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Filler Name (e.g., Bubble Wrap)"
        required
        className="flex-grow w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
      />
      <button
        type="submit"
        className="flex-shrink-0 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
      >
        Save Filler
      </button>
    </form>
  );
}

export default FillerForm;