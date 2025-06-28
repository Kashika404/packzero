




import React from 'react';

function ProductItem({ product, onDelete, onAddToCart, onEdit }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 flex justify-between items-center transition-shadow hover:shadow-md">
      <div>
        <strong className="text-lg text-gray-800">{product.name}</strong> 
        {product.isFragile && <span className="ml-2 text-xs font-semibold bg-red-100 text-red-800 px-2 py-1 rounded-full">Fragile</span>}
        <p className="text-sm text-gray-600">Dimensions: {product.length}x{product.width}x{product.height} cm | Weight: {product.weight} kg</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 text-sm font-semibold transition-colors" onClick={() => onAddToCart(product)}>Add to Cart</button>
        <button className="bg-yellow-400 text-gray-800 px-3 py-1 rounded-md hover:bg-yellow-500 text-sm font-semibold transition-colors" onClick={() => onEdit(product)}>Edit</button>
        <button className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 text-sm font-semibold transition-colors" onClick={() => onDelete(product.id)}>Delete</button>
      </div>
    </div>
  );
}

export default ProductItem;