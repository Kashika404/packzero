

import React from 'react';

function FilterControls({ searchTerm, setSearchTerm, filter, setFilter, filterOptions, searchPlaceholder }) {
  return (
    <div className="mb-4 p-4 bg-gray-100 rounded-lg flex flex-col sm:flex-row gap-4 items-center">
      
      <div className="flex-grow w-full sm:w-auto">
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

     
      <div className="flex items-center gap-4">
        <span className="font-semibold text-gray-700">Show:</span>
        <div className="flex items-center gap-2">
          {filterOptions.map(option => (
            <label key={option.value} className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name={`filter-${searchPlaceholder}`} 
                value={option.value}
                checked={filter === option.value}
                onChange={(e) => setFilter(e.target.value)}
                className="h-4 w-4"
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FilterControls;