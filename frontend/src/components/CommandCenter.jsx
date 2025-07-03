import React from 'react';
import DashboardCard from './DashboardCard';
import { mockData } from '../mockData'; 
import './CommandCenter.css';


import { FiShoppingCart, FiAlertTriangle, FiTruck } from 'react-icons/fi';

const CommandCenter = () => {
 
  const itemsAwaitingRecommendation = mockData.cart.length;

  
  const lowStockThreshold = 15;
  const lowStockItems = mockData.inventory
    .filter(item => item.quantity <= lowStockThreshold)
    .sort((a, b) => a.quantity - b.quantity) 
    .slice(0, 3); 


  const { today, yesterday } = mockData.shipments;
  const shipmentComparison = today - yesterday;

  return (
    <section className="command-center">
      
      <DashboardCard
        title="Awaiting Recommendation"
        icon={<FiShoppingCart />}
      >
        <div className="stat-number">{itemsAwaitingRecommendation}</div>
        <div className="stat-label">Items in Cart</div>
      </DashboardCard>


      <DashboardCard title="Low Stock Alert" icon={<FiAlertTriangle />}>
        {lowStockItems.length > 0 ? (
          <ul className="low-stock-list">
            {lowStockItems.map(item => (
              <li key={item.id} className="low-stock-item">
                <span className="item-name">{item.name}</span>
                <span className="item-quantity">{item.quantity} left</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-state">✅ All stock levels are healthy.</div>
        )}
      </DashboardCard>


      <DashboardCard title="Shipments Today" icon={<FiTruck />}>
        <div className="stat-number">{today}</div>
        {shipmentComparison !== 0 && (
           <div className="stat-comparison" style={{ color: shipmentComparison > 0 ? '#10b981' : '#ef4444' }}>
             {shipmentComparison > 0 ? '▲' : '▼'} {Math.abs(shipmentComparison)} from yesterday
           </div>
        )}
      </DashboardCard>
    </section>
  );
};

export default CommandCenter;