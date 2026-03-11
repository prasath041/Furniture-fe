import React, { useState, useEffect } from 'react';
import { deliveryAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './DeliveryDashboard.css';

const DeliveryDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [receivedBy, setReceivedBy] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, ordersRes, historyRes] = await Promise.all([
        deliveryAPI.getStats(),
        deliveryAPI.getMyOrders(),
        deliveryAPI.getHistory()
      ]);
      setStats(statsRes.data.data);
      setOrders(ordersRes.data.data);
      setHistory(historyRes.data.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePickup = async (orderId) => {
    try {
      await deliveryAPI.pickupOrder(orderId);
      fetchData();
    } catch (err) {
      alert('Failed to pickup order');
    }
  };

  const handleUpdateStatus = async (orderId, status, location) => {
    try {
      await deliveryAPI.updateStatus(orderId, { status, location });
      fetchData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelivery = async (orderId) => {
    try {
      await deliveryAPI.confirmDelivery(orderId, { 
        notes: deliveryNotes, 
        receivedBy 
      });
      setSelectedOrder(null);
      setDeliveryNotes('');
      setReceivedBy('');
      fetchData();
    } catch (err) {
      alert('Failed to confirm delivery');
    }
  };

  const handleToggleAvailability = async () => {
    try {
      await deliveryAPI.toggleAvailability();
      fetchData();
    } catch (err) {
      alert('Failed to toggle availability');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'ready_for_pickup': '#f39c12',
      'picked_up': '#3498db',
      'in_transit': '#9b59b6',
      'out_for_delivery': '#2ecc71',
      'delivered': '#27ae60'
    };
    return colors[status] || '#95a5a6';
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="delivery-dashboard">
      <div className="delivery-banner">
        <div className="banner-overlay">
          <h1>🚚 Delivery Dashboard</h1>
          <p>Welcome back, {user?.name}!</p>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Stats Section */}
        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <h3>{stats?.pendingDeliveries || 0}</h3>
              <p>Pending Deliveries</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{stats?.todayDelivered || 0}</h3>
              <p>Delivered Today</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-info">
              <h3>{stats?.totalDelivered || 0}</h3>
              <p>Total Deliveries</p>
            </div>
          </div>
          <div className="stat-card availability">
            <div className="stat-icon">{stats?.isAvailable ? '🟢' : '🔴'}</div>
            <div className="stat-info">
              <h3>{stats?.isAvailable ? 'Available' : 'Unavailable'}</h3>
              <button onClick={handleToggleAvailability} className="toggle-btn">
                Toggle Status
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button 
            className={activeTab === 'pending' ? 'active' : ''} 
            onClick={() => setActiveTab('pending')}
          >
            📦 Pending Orders ({orders.length})
          </button>
          <button 
            className={activeTab === 'history' ? 'active' : ''} 
            onClick={() => setActiveTab('history')}
          >
            📜 Delivery History
          </button>
        </div>

        {/* Orders List */}
        {activeTab === 'pending' && (
          <div className="orders-section">
            {orders.length === 0 ? (
              <div className="no-orders">
                <div className="no-orders-icon">📭</div>
                <h3>No Pending Deliveries</h3>
                <p>You're all caught up! Check back later for new orders.</p>
              </div>
            ) : (
              <div className="orders-grid">
                {orders.map(order => (
                  <div key={order._id} className="order-card">
                    <div className="order-header">
                      <span className="order-number">{order.orderNumber}</span>
                      <span 
                        className="order-status" 
                        style={{ backgroundColor: getStatusColor(order.orderStatus) }}
                      >
                        {order.orderStatus?.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="order-customer">
                      <h4>👤 {order.customer?.name}</h4>
                      <p>📞 {order.customer?.phone}</p>
                    </div>
                    
                    <div className="order-address">
                      <h5>📍 Delivery Address</h5>
                      <p>{order.shippingAddress?.street}</p>
                      <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                      <p>{order.shippingAddress?.zipCode}</p>
                    </div>
                    
                    <div className="order-items">
                      <h5>📦 Items ({order.items?.length})</h5>
                      <ul>
                        {order.items?.slice(0, 2).map((item, idx) => (
                          <li key={idx}>{item.name} × {item.quantity}</li>
                        ))}
                        {order.items?.length > 2 && (
                          <li className="more">+{order.items.length - 2} more items</li>
                        )}
                      </ul>
                    </div>
                    
                    <div className="order-amount">
                      <span>Total:</span>
                      <strong>₹{order.totalAmount?.toLocaleString()}</strong>
                      {order.paymentMethod === 'cod' && (
                        <span className="cod-badge">COD</span>
                      )}
                    </div>
                    
                    <div className="order-actions">
                      {order.orderStatus === 'ready_for_pickup' && (
                        <button 
                          className="btn-pickup"
                          onClick={() => handlePickup(order._id)}
                        >
                          🏪 Pick Up
                        </button>
                      )}
                      {order.orderStatus === 'picked_up' && (
                        <button 
                          className="btn-transit"
                          onClick={() => handleUpdateStatus(order._id, 'in_transit')}
                        >
                          🚛 Start Transit
                        </button>
                      )}
                      {order.orderStatus === 'in_transit' && (
                        <button 
                          className="btn-out"
                          onClick={() => handleUpdateStatus(order._id, 'out_for_delivery')}
                        >
                          🚚 Out for Delivery
                        </button>
                      )}
                      {order.orderStatus === 'out_for_delivery' && (
                        <button 
                          className="btn-deliver"
                          onClick={() => setSelectedOrder(order)}
                        >
                          ✅ Confirm Delivery
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* History */}
        {activeTab === 'history' && (
          <div className="history-section">
            <div className="history-table-container">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Delivered On</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(order => (
                    <tr key={order._id}>
                      <td>{order.orderNumber}</td>
                      <td>{order.customer?.name}</td>
                      <td>₹{order.totalAmount?.toLocaleString()}</td>
                      <td>
                        <span className={`status-badge ${order.orderStatus}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td>
                        {order.actualDelivery 
                          ? new Date(order.actualDelivery).toLocaleDateString() 
                          : '-'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Delivery Confirmation Modal */}
        {selectedOrder && (
          <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setSelectedOrder(null)}>×</button>
              <h3>✅ Confirm Delivery</h3>
              <p>Order: <strong>{selectedOrder.orderNumber}</strong></p>
              <p>Customer: <strong>{selectedOrder.customer?.name}</strong></p>
              <p>Amount: <strong>₹{selectedOrder.totalAmount?.toLocaleString()}</strong></p>
              
              {selectedOrder.paymentMethod === 'cod' && (
                <div className="cod-warning">
                  ⚠️ Collect ₹{selectedOrder.totalAmount?.toLocaleString()} (Cash on Delivery)
                </div>
              )}
              
              <div className="form-group">
                <label>Received By</label>
                <input
                  type="text"
                  placeholder="Name of person who received"
                  value={receivedBy}
                  onChange={(e) => setReceivedBy(e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label>Delivery Notes</label>
                <textarea
                  placeholder="Any notes about the delivery..."
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                />
              </div>
              
              <button 
                className="btn-confirm"
                onClick={() => handleDelivery(selectedOrder._id)}
              >
                Confirm Delivery
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryDashboard;
