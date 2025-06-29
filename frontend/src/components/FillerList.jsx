
import React from 'react';

function FillerList({ items, onDelete }) {
  return (
    <div className="space-y-3">
      {items.map(item => (
        <div 
          key={item.id} 
          className="border border-gray-200 rounded-lg p-3 flex justify-between items-center transition-shadow hover:shadow-md"
        >
          <span className="text-gray-800 font-medium">{item.name}</span>
          <button 
            className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 text-sm font-semibold transition-colors"
            onClick={() => onDelete(item.id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default FillerList;