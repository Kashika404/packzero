

// import React from 'react';
// import ProductItem from './ProductItem';

// // This component receives 'onEdit' as a prop from App.jsx
// function ProductList({ products, onDelete, onAddToCart, onEdit }) {
//   return (
//     <div className="product-list">
//       {products.map(product => (
//         <ProductItem
//           key={product.id}
//           product={product}
//           onDelete={onDelete}
//           onAddToCart={onAddToCart}
         
//           onEdit={onEdit}
//         />
//       ))}
//     </div>
//   );
// }

// export default ProductList;


import React from 'react';
import ProductItem from './ProductItem';

// This component receives 'onEdit' as a prop from App.jsx
function ProductList({ products, onDelete, onAddToCart, onEdit }) {
  return (
    // The "space-y-4" class adds a vertical margin between each child item.
    <div className="space-y-4"> 
      {products.map(product => ( //
        <ProductItem
          key={product.id} //
          product={product} //
          onDelete={onDelete} //
          onAddToCart={onAddToCart} //
          onEdit={onEdit} //
        />
      ))}
    </div>
  );
}

export default ProductList;