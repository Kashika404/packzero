

export const mockData = {
  cart: [
 
    { id: 'prod3', name: 'Sneakers', weight_kg: 1.2, length_cm: 30, width_cm: 20, height_cm: 12 },
    { id: 'prod1', name: 'T-Shirt', weight_kg: 0.3, length_cm: 25, width_cm: 20, height_cm: 2 },
  ],

  inventory: [
    { 
      id: 'pack1', 
      name: 'Medium Box', 
      quantity: 12, 
      type: 'packaging', 
   
      properties: {
        length_cm: 35,
        width_cm: 25,
        height_cm: 15,
        weight_kg: 0.4,       
        max_weight_kg: 5   
      }
    },
    { 
      id: 'pack3', 
      name: 'Eco-Mailer S', 
      quantity: 5, 
      type: 'packaging',
      properties: {
        length_cm: 25,
        width_cm: 20,
        height_cm: 1,
        weight_kg: 0.05,
        max_weight_kg: 0.5
      }
    },

    { id: 'prod4', name: 'Sunglasses', quantity: 25, type: 'product' },
    { id: 'prod5', name: 'Watch', quantity: 50, type: 'product' },
  ],

  shipments: {
    today: 117,
    yesterday: 109,
  }
};