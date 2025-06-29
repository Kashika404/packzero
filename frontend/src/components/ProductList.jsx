

import React from 'react';
import ProductItem from './ProductItem';


function ProductList({ products, onDelete, onAddToCart, onEdit }) {
  return (
    
    <div className="space-y-4"> 
      {products.map(product => ( 
        <ProductItem
          key={product.id} 
          product={product} 
          onDelete={onDelete} 
          onAddToCart={onAddToCart} 
          onEdit={onEdit} 
        />
      ))}
    </div>
  );
}

export default ProductList;