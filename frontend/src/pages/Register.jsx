
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useAuth(); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 5) {
      toast.error("Password must be at least 5 characters long.");
      return;
    }
    
    try {
      await register(email, password);
      toast.success("Registration successful! Please log in.");
      navigate('/login');
    } catch (error) {
      
      const errorMessage = error.response?.data?.message || "An unknown registration error occurred.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Register for PackZero</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            className="w-full p-3 border rounded-md" 
          />
          <input 
            type="password" 
            placeholder="Password (min 5 characters)" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            className="w-full p-3 border rounded-md" 
          />
          <button 
            type="submit" 
            className="w-full bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700">
            Register
          </button>
        </form>
        <p className="mt-4 text-center">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;