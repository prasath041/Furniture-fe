import React, { useState, useEffect } from 'react';
import { shopkeeperAPI, deliveryAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './ShopkeeperDashboard.css';

const ShopkeeperDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [agents, setAgents] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, ordersRes, inventoryRes, lowStockRes, agentsRes] = await Promise.all([
        shopkeeperAPI.getDashboard(),
        shopkeeperAPI.getOrders(),
        shopkeeperAPI.getInventory(),
        shopkeeperAPI.getLowStock(5),
        deliveryAPI.getAvailableAgents()
      ]);
      setStats(statsRes.data.data);
      setOrders(ordersRes.data.data);
      setInventory(inventoryRes.data.data);
      setLowStock(lowStockRes.data.data);
      setAgents(agentsRes.data.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async (orderId) => {
    try {
      await shopkeeperAPI.confirmOrder(orderId);
      fetchData();
    } catch (err) {
      alert('Failed to confirm order');
    }
  };

  const handleStartProcessing = async (orderId) => {
    try {
      await shopkeeperAPI.startProcessing(orderId);
      fetchData();
    } catch (err) {
      alert('Failed to start processing');
    }
  };

  const handleMarkReady = async (orderId) => {
    try {
      await shopkeeperAPI.markReady(orderId);
      fetchData();
    } catch (err) {
      alert('Failed to mark as ready');
    }
  };

  const handleUpdateStock = async (productType, productId, newStock) => {
    try {
      await shopkeeperAPI.updateStock({ productType, productId, stock: parseInt(newStock) });
      fetchData();
      alert('Stock updated successfully');
    } catch (err) {
      alert('Failed to update stock');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'placed': { bg: '#3498db', text: 'New Order' },
      'confirmed': { bg: '#9b59b6', text: 'Confirmed' },
      'processing': { bg: '#f39c12', text: 'Processing' }
    };
    return badges[status] || { bg: '#95a5a6', text: status };
  };

  const getAllProducts = () => {
    if (!inventory) return [];
    const allProducts = [
      ...(inventory.furniture || []),
      ...(inventory.doors || []),
      ...(inventory.windows || []),
      ...(inventory.lockers || []),
      ...(inventory.pipes || []),
      ...(inventory.woods || [])
    ];
    
    if (selectedCategory === 'all') return allProducts;
    return allProducts.filter(p => p.productType === selectedCategory);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="shopkeeper-dashboard">
      <div className="shopkeeper-banner">
        <div className="banner-overlay">
          <h1>🏪 Shopkeeper Dashboard</h1>
          <p>Welcome back, {user?.name}!</p>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Stats Section */}
        <div className="stats-section">
          <div className="stat-card new-orders">
            <div className="stat-icon">📥</div>
            <div className="stat-info">
              <h3>{stats?.pendingOrders || 0}</h3>
              <p>New Orders</p>
            </div>
          </div>
          <div className="stat-card processing">
            <div className="stat-icon">⚙️</div>
            <div className="stat-info">
              <h3>{stats?.processingOrders || 0}</h3>
              <p>Processing</p>
            </div>
          </div>
          <div className="stat-card ready">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{stats?.readyForPickup || 0}</h3>
              <p>Ready for Pickup</p>
            </div>
          </div>
          <div className="stat-card alerts">
            <div className="stat-icon">⚠️</div>
            <div className="stat-info">
              <h3>{stats?.lowStockCount || 0}</h3>
              <p>Low Stock Alerts</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button 
            className={activeTab === 'orders' ? 'active' : ''} 
            onClick={() => setActiveTab('orders')}
          >
            📋 Orders to Process
          </button>
          <button 
            className={activeTab === 'inventory' ? 'active' : ''} 
            onClick={() => setActiveTab('inventory')}
          >
            📦 Manage Inventory
          </button>
          <button 
            className={activeTab === 'lowstock' ? 'active' : ''} 
            onClick={() => setActiveTab('lowstock')}
          >
            ⚠️ Low Stock ({lowStock.length})
          </button>
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="orders-section">
            {orders.length === 0 ? (
              <div className="no-data">
                <div className="no-data-icon">📭</div>
                <h3>No Orders to Process</h3>
                <p>All orders have been processed!</p>
              </div>
            ) : (
              <div className="orders-table-container">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => {
                      const badge = getStatusBadge(order.orderStatus);
                      return (
                        <tr key={order._id}>
                          <td>
                            <strong>{order.orderNumber}</strong>
                            <br />
                            <small>{new Date(order.createdAt).toLocaleString()}</small>
                          </td>
                          <td>
                            {order.customer?.name}
                            <br />
                            <small>{order.customer?.phone}</small>
                          </td>
                          <td>
                            <ul className="items-list">
                              {order.items?.map((item, idx) => (
                                <li key={idx}>{item.name} × {item.quantity}</li>
                              ))}
                            </ul>
                          </td>
                          <td>₹{order.totalAmount?.toLocaleString()}</td>
                          <td>
                            <span 
                              className="status-badge" 
                              style={{ backgroundColor: badge.bg }}
                            >
                              {badge.text}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              {order.orderStatus === 'placed' && (
                                <button 
                                  className="btn-confirm"
                                  onClick={() => handleConfirmOrder(order._id)}
                                >
                                  ✅ Confirm
                                </button>
                              )}
                              {order.orderStatus === 'confirmed' && (
                                <button 
                                  className="btn-process"
                                  onClick={() => handleStartProcessing(order._id)}
                                >
                                  ⚙️ Start Processing
                                </button>
                              )}
                              {order.orderStatus === 'processing' && (
                                <button 
                                  className="btn-ready"
                                  onClick={() => handleMarkReady(order._id)}
                                >
                                  📦 Mark Ready
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="inventory-section">
            <div className="inventory-filters">
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Products</option>
                <option value="Furniture">Furniture</option>
                <option value="Door">Doors</option>
                <option value="Window">Windows</option>
                <option value="Locker">Lockers</option>
                <option value="Pipe">Pipes</option>
                <option value="Wood">Woods</option>
              </select>
            </div>
            
            <div className="inventory-grid">
              {getAllProducts().map((product, index) => (
                <div key={`${product._id}-${index}`} className="inventory-card">
                  <div className="product-image">
                    {product.images?.[0] ? (
                      <img 
                        src={`http://localhost:5000${product.images[0]}`} 
                        alt={product.name} 
                      />
                    ) : (
                      <div className="no-image">📦</div>
                    )}
                  </div>
                  <div className="product-info">
                    <h4>{product.name}</h4>
                    <span className="product-type">{product.productType}</span>
                    <p className="product-price">₹{product.price?.toLocaleString()}</p>
                  </div>
                  <div className="stock-control">
                    <label>Stock:</label>
                    <input
                      type="number"
                      min="0"
                      defaultValue={product.stock || 0}
                      className={product.stock <= 5 ? 'low-stock' : ''}
                      onBlur={(e) => {
                        if (e.target.value !== String(product.stock)) {
                          handleUpdateStock(product.productType, product._id, e.target.value);
                        }
                      }}
                    />
                  </div>
                  <div className={`availability ${product.isAvailable ? 'available' : 'unavailable'}`}>
                    {product.isAvailable ? '✅ Available' : '❌ Unavailable'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Low Stock Tab */}
        {activeTab === 'lowstock' && (
          <div className="lowstock-section">
            {lowStock.length === 0 ? (
              <div className="no-data">
                <div className="no-data-icon">✅</div>
                <h3>Stock Levels Good</h3>
                <p>No products are running low on stock</p>
              </div>
            ) : (
              <div className="lowstock-grid">
                {lowStock.map((item, index) => (
                  <div key={`${item._id}-${index}`} className="lowstock-card">
                    <div className="lowstock-icon">⚠️</div>
                    <div className="lowstock-info">
                      <h4>{item.name}</h4>
                      <span className="product-type">{item.productType}</span>
                    </div>
                    <div className="lowstock-details">
                      <span className={`stock-count ${item.stock <= 2 ? 'critical' : 'warning'}`}>
                        {item.stock} left
                      </span>
                      <input
                        type="number"
                        min="0"
                        placeholder="New stock"
                        className="restock-input"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateStock(item.productType, item._id, e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Available Delivery Agents */}
        <div className="agents-section">
          <h3>🚚 Available Delivery Agents ({agents.length})</h3>
          <div className="agents-list">
            {agents.map(agent => (
              <div key={agent._id} className="agent-card">
                <div className="agent-avatar">👤</div>
                <div className="agent-info">
                  <h4>{agent.name}</h4>
                  <p>📞 {agent.phone}</p>
                  <p>📍 {agent.currentLocation || 'Location not set'}</p>
                </div>
                <div className="agent-stats">
                  <span>{agent.totalDeliveries || 0} deliveries</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopkeeperDashboard;
