import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; //
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

function Analytics() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const { api } = useAuth(); //

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await api.get('/analytics/summary');
        setSummary(response.data);
      } catch (error) {
        console.error("Failed to fetch analytics summary", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [api]);

  if (loading) {
    return <div className="text-center p-10">Loading Analytics...</div>;
  }

  if (!summary) {
    return <div className="text-center p-10">Could not load analytics data.</div>;
  }
  
  const chartData = [
    { name: 'Volume Saved (cm³)', value: parseFloat(summary.volumeSaved.toFixed(2)) },
    { name: 'Cost Saved ($)', value: parseFloat(summary.costSaved.toFixed(2)) },
    { name: 'CO₂ Saved (kg)', value: parseFloat(summary.co2Saved.toFixed(2)) },
  ];

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold leading-tight text-gray-900">Analytics Dashboard</h1>
          <Link to="/" className="text-blue-600 hover:underline">← Back to Dashboard</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-lg font-semibold text-gray-600">Total Volume Saved</h3>
            <p className="text-3xl font-bold text-blue-600">{summary.volumeSaved.toFixed(2)} cm³</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-lg font-semibold text-gray-600">Total Cost Saved</h3>
            <p className="text-3xl font-bold text-green-600">${summary.costSaved.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-lg font-semibold text-gray-600">Total CO₂ Emissions Saved</h3>
            <p className="text-3xl font-bold text-teal-600">{summary.co2Saved.toFixed(2)} kg</p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Savings Summary</h2>
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${value}`} />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Analytics;