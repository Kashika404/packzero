import React from 'react';

function PackagingItem({ item, onDelete }) {
   const stockLevel = item.quantity;
  
  const isLowStock = stockLevel <= 5;

  return (
    <div className="border border-gray-200 rounded-lg p-4 flex justify-between items-center transition-shadow hover:shadow-md">
     
      <div>
        <strong className="text-lg text-gray-800">{item.name}</strong>
        <span className="ml-2 text-xs font-semibold bg-gray-100 text-gray-800 px-2 py-1 rounded-full align-middle">
          {item.type}
        </span>
        <p className="text-sm text-gray-600">
          Dimensions: {item.length}x{item.width}x{item.height} cm | Max Weight: {item.maxWeight} kg
        </p>
        <p className={`text-sm font-bold ${isLowStock ? 'text-red-500' : 'text-gray-700'}`}>
          Stock: {stockLevel} {isLowStock && '(Low Stock!)'}
        </p>

      </div>

 
      <div className="flex-shrink-0">
        <button 
          className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 text-sm font-semibold transition-colors"
          onClick={() => onDelete(item.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default PackagingItem;