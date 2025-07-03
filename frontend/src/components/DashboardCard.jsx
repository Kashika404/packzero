import React from 'react';
import './CommandCenter.css'; 

const DashboardCard = ({ icon, title, children }) => {
  return (
    <div className="dashboard-card">
      <div className="card-header">
        <div className="card-icon">{icon}</div>
        <h3 className="card-title">{title}</h3>
      </div>
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};

export default DashboardCard;