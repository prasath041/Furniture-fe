import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';
import './Admin.css';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await analyticsAPI.getDashboard();
      setAnalytics(response.data.data);
    } catch (err) {
      setError('Failed to fetch analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading analytics...</div>;
  if (error) return <div className="error">{error}</div>;

  const { summary, charts, tables } = analytics || {};

  return (
    <div className="analytics-dashboard">
      <h2>📊 Analytics Dashboard</h2>

      {/* Summary Cards */}
      <div className="analytics-summary">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>{summary?.totalOrders || 0}</h3>
            <p>Total Orders</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{summary?.totalUsers || 0}</h3>
            <p>Total Customers</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🪑</div>
          <div className="stat-info">
            <h3>{summary?.totalProducts || 0}</h3>
            <p>Total Products</p>
          </div>
        </div>
        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>₹{summary?.monthlyRevenue?.toLocaleString() || 0}</h3>
            <p>Monthly Revenue</p>
            <span className={`growth ${summary?.revenueGrowth >= 0 ? 'positive' : 'negative'}`}>
              {summary?.revenueGrowth >= 0 ? '↑' : '↓'} {Math.abs(summary?.revenueGrowth || 0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Order Status Distribution */}
      <div className="analytics-section">
        <h3>📋 Order Status Distribution</h3>
        <div className="status-distribution">
          {charts?.orderStatusDistribution?.map(item => (
            <div key={item._id} className={`status-bar ${item._id}`}>
              <span className="status-label">{item._id?.replace('_', ' ')}</span>
              <div className="status-bar-fill">
                <div 
                  className="fill" 
                  style={{ width: `${(item.count / summary?.totalOrders) * 100}%` }}
                />
              </div>
              <span className="status-count">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Orders Chart */}
      <div className="analytics-section">
        <h3>📈 Daily Orders (Last 7 Days)</h3>
        <div className="chart-container">
          <div className="bar-chart">
            {charts?.dailyOrders?.map(day => (
              <div key={day._id} className="bar-item">
                <div 
                  className="bar" 
                  style={{ 
                    height: `${Math.max(day.count * 20, 10)}px` 
                  }}
                >
                  <span className="bar-value">{day.count}</span>
                </div>
                <span className="bar-label">{new Date(day._id).toLocaleDateString('en-US', { weekday: 'short' })}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="analytics-section">
        <h3>🏆 Top Selling Products</h3>
        <div className="table-container">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Units Sold</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {tables?.topProducts?.map((product, index) => (
                <tr key={index}>
                  <td>
                    <span className="rank">#{index + 1}</span> {product._id}
                  </td>
                  <td>{product.totalSold}</td>
                  <td>₹{product.revenue?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="analytics-section">
        <h3>🕐 Recent Orders</h3>
        <div className="table-container">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {tables?.recentOrders?.slice(0, 5).map(order => (
                <tr key={order._id}>
                  <td>{order.orderNumber}</td>
                  <td>{order.customer?.name || 'N/A'}</td>
                  <td>₹{order.totalAmount?.toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${order.orderStatus}`}>
                      {order.orderStatus?.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="analytics-section alert-section">
        <h3>⚠️ Low Stock Alerts</h3>
        <div className="low-stock-list">
          {tables?.lowStockAlerts?.length > 0 ? (
            tables.lowStockAlerts.map(item => (
              <div key={item._id} className="low-stock-item">
                <span className="item-name">{item.name}</span>
                <span className={`stock-count ${item.stock <= 2 ? 'critical' : 'warning'}`}>
                  {item.stock} left
                </span>
              </div>
            ))
          ) : (
            <p className="no-alerts">No low stock items</p>
          )}
        </div>
      </div>

      {/* Delivery Agent Performance */}
      <div className="analytics-section">
        <h3>🚚 Delivery Agent Performance</h3>
        <div className="table-container">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Deliveries Completed</th>
              </tr>
            </thead>
            <tbody>
              {tables?.deliveryAgentPerformance?.map((agent, index) => (
                <tr key={index}>
                  <td>{agent._id?.name || 'Unknown'}</td>
                  <td>{agent.deliveries}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
