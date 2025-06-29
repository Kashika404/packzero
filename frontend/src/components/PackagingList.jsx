


import React from 'react';
import PackagingItem from './PackagingItem';

function PackagingList({ items, onDelete }) {
 
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