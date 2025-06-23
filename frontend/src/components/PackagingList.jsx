// import React from 'react';
// import PackagingItem from './PackagingItem';

// function PackagingList({ items, onDelete }) {
//   return (
//     <div className="product-list">
//       {items.map(item => (
//         <PackagingItem
//           key={item.id}
//           item={item}
//           onDelete={onDelete}
//         />
//       ))}
//     </div>
//   );
// }

// export default PackagingList;


import React from 'react';
import PackagingItem from './PackagingItem';

function PackagingList({ items, onDelete }) {
  // This component now uses space-y-4 to add a gap between each PackagingItem card.
  return (
    <div className="space-y-4">
      {items.map(item => (
        <PackagingItem
          key={item.id}
          item={item}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default PackagingList;