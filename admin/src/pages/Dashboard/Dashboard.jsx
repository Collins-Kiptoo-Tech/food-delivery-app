import React from 'react'
import './Dashboard.css'

const Dashboard = () => {
  // You can fetch real stats from your API later
  const stats = {
    totalRestaurants: 2,
    totalFoodItems: 12,
    totalOrders: 24,
    totalCategories: 5
  }

  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>
      <p className="welcome-text">Welcome to FreshFeast Admin Panel</p>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Restaurants</h3>
          <p className="stat-number">{stats.totalRestaurants}</p>
        </div>
        <div className="stat-card">
          <h3>Total Food Items</h3>
          <p className="stat-number">{stats.totalFoodItems}</p>
        </div>
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p className="stat-number">{stats.totalOrders}</p>
        </div>
        <div className="stat-card">
          <h3>Categories</h3>
          <p className="stat-number">{stats.totalCategories}</p>
        </div>
      </div>

      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <p>No recent activity</p>
      </div>
    </div>
  )
}

export default Dashboard