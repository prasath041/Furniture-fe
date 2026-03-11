import React, { useState, useEffect } from 'react';
import { orderAPI, deliveryAPI } from '../../services/api';
import './Admin.css';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [agents, setAgents] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
    fetchAgents();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await orderAPI.getAll(params);
      setOrders(response.data.data);
    } catch (err) {
      setError('Failed to fetch orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await deliveryAPI.getAvailableAgents();
      setAgents(response.data.data);
    } catch (err) {
      console.error('Failed to fetch agents', err);
    }
  };

  const handleStatusUpdate = async (orderId, status, description) => {
    try {
      await orderAPI.updateStatus(orderId, { status, description });
      fetchOrders();
      setSelectedOrder(null);
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const handleAssignAgent = async (orderId, deliveryAgentId) => {
    try {
      await orderAPI.assignAgent(orderId, { deliveryAgentId });
      fetchOrders();
    } catch (err) {
      setError('Failed to assign agent');
    }
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      'placed': 'status-placed',
      'confirmed': 'status-confirmed',
      'processing': 'status-processing',
      'ready_for_pickup': 'status-ready',
      'picked_up': 'status-pickup',
      'in_transit': 'status-transit',
      'out_for_delivery': 'status-out',
      'delivered': 'status-delivered',
      'cancelled': 'status-cancelled'
    };
    return classes[status] || '';
  };

  if (loading) return <div className="loading">Loading orders...</div>;

  return (
    <div className="manage-orders">
      <div className="page-header">
        <h2>📦 Manage Orders</h2>
        <div className="filter-controls">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Orders</option>
            <option value="placed">Placed</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="ready_for_pickup">Ready for Pickup</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Delivery Agent</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id}>
                <td>
                  <strong>{order.orderNumber}</strong>
                  <br />
                  <small>{new Date(order.createdAt).toLocaleDateString()}</small>
                </td>
                <td>
                  {order.customer?.name}
                  <br />
                  <small>{order.customer?.phone}</small>
                </td>
                <td>
                  {order.items?.length} item(s)
                </td>
                <td>₹{order.totalAmount?.toLocaleString()}</td>
                <td>
                  <span className={`status-badge ${getStatusBadgeClass(order.orderStatus)}`}>
                    {order.orderStatus?.replace('_', ' ')}
                  </span>
                </td>
                <td>
                  <span className={`payment-badge ${order.paymentStatus}`}>
                    {order.paymentStatus}
                  </span>
                </td>
                <td>
                  {order.deliveryAgent ? (
                    <span>{order.deliveryAgent.name}</span>
                  ) : (
                    <select 
                      onChange={(e) => handleAssignAgent(order._id, e.target.value)}
                      defaultValue=""
                    >
                      <option value="" disabled>Assign Agent</option>
                      {agents.map(agent => (
                        <option key={agent._id} value={agent._id}>
                          {agent.name}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
                <td>
                  <button 
                    className="btn-view"
                    onClick={() => setSelectedOrder(order)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content order-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedOrder(null)}>×</button>
            <h3>Order Details - {selectedOrder.orderNumber}</h3>
            
            <div className="order-details">
              <div className="detail-section">
                <h4>Customer Information</h4>
                <p><strong>Name:</strong> {selectedOrder.customer?.name}</p>
                <p><strong>Email:</strong> {selectedOrder.customer?.email}</p>
                <p><strong>Phone:</strong> {selectedOrder.customer?.phone}</p>
              </div>

              <div className="detail-section">
                <h4>Shipping Address</h4>
                <p>{selectedOrder.shippingAddress?.street}</p>
                <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                <p>{selectedOrder.shippingAddress?.zipCode}</p>
              </div>

              <div className="detail-section">
                <h4>Order Items</h4>
                <ul className="order-items-list">
                  {selectedOrder.items?.map((item, index) => (
                    <li key={index}>
                      {item.name} × {item.quantity} - ₹{item.price * item.quantity}
                    </li>
                  ))}
                </ul>
                <p className="order-total"><strong>Total:</strong> ₹{selectedOrder.totalAmount?.toLocaleString()}</p>
              </div>

              <div className="detail-section">
                <h4>Order Tracking</h4>
                <div className="tracking-timeline">
                  {selectedOrder.tracking?.map((track, index) => (
                    <div key={index} className="tracking-item">
                      <div className="tracking-dot"></div>
                      <div className="tracking-info">
                        <span className="tracking-status">{track.status?.replace('_', ' ')}</span>
                        <span className="tracking-desc">{track.description}</span>
                        <span className="tracking-time">
                          {new Date(track.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="detail-section">
                <h4>Update Status</h4>
                <div className="status-buttons">
                  <button 
                    onClick={() => handleStatusUpdate(selectedOrder._id, 'confirmed', 'Order confirmed')}
                    disabled={selectedOrder.orderStatus !== 'placed'}
                  >
                    Confirm
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(selectedOrder._id, 'processing', 'Order is being processed')}
                    disabled={selectedOrder.orderStatus !== 'confirmed'}
                  >
                    Process
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(selectedOrder._id, 'ready_for_pickup', 'Ready for delivery')}
                    disabled={selectedOrder.orderStatus !== 'processing'}
                  >
                    Ready
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
