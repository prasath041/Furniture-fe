import React, { useState, useEffect } from 'react';
import { bookingAPI } from '../../services/api';
import './Admin.css';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getAll();
      setBookings(response.data.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await bookingAPI.updateStatus(id, { status });
      alert('Booking status updated');
      fetchBookings();
    } catch (error) {
      alert(error.response?.data?.message || 'Update failed');
    }
  };

  const handlePaymentStatusChange = async (id, paymentStatus) => {
    try {
      await bookingAPI.updateStatus(id, { paymentStatus });
      alert('Payment status updated');
      fetchBookings();
    } catch (error) {
      alert(error.response?.data?.message || 'Update failed');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f39c12';
      case 'confirmed': return '#3498db';
      case 'processing': return '#9b59b6';
      case 'delivered': return '#27ae60';
      case 'cancelled': return '#e74c3c';
      default: return '#7f8c8d';
    }
  };

  const getPaymentColor = (status) => {
    switch (status) {
      case 'paid': return '#27ae60';
      case 'pending': return '#f39c12';
      case 'failed': return '#e74c3c';
      default: return '#7f8c8d';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const bookingStats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    processing: bookings.filter(b => b.status === 'processing').length,
    delivered: bookings.filter(b => b.status === 'delivered').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    totalRevenue: bookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.totalPrice, 0)
  };

  if (loading) return <div className="loading">Loading bookings...</div>;

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>📦 Manage Bookings</h2>
      </div>

      {/* Booking Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' }}>
        <div style={{ background: '#3498db', color: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{bookingStats.total}</div>
          <div style={{ fontSize: '12px' }}>Total Bookings</div>
        </div>
        <div style={{ background: '#f39c12', color: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{bookingStats.pending}</div>
          <div style={{ fontSize: '12px' }}>Pending</div>
        </div>
        <div style={{ background: '#9b59b6', color: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{bookingStats.processing}</div>
          <div style={{ fontSize: '12px' }}>Processing</div>
        </div>
        <div style={{ background: '#27ae60', color: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{bookingStats.delivered}</div>
          <div style={{ fontSize: '12px' }}>Delivered</div>
        </div>
        <div style={{ background: '#2c3e50', color: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>₹{bookingStats.totalRevenue.toLocaleString()}</div>
          <div style={{ fontSize: '12px' }}>Total Revenue</div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setFilter('all')} 
          style={{ 
            padding: '8px 16px', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            background: filter === 'all' ? '#3498db' : '#ecf0f1',
            color: filter === 'all' ? 'white' : '#333'
          }}
        >
          All ({bookingStats.total})
        </button>
        <button 
          onClick={() => setFilter('pending')} 
          style={{ 
            padding: '8px 16px', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            background: filter === 'pending' ? '#f39c12' : '#ecf0f1',
            color: filter === 'pending' ? 'white' : '#333'
          }}
        >
          Pending ({bookingStats.pending})
        </button>
        <button 
          onClick={() => setFilter('confirmed')} 
          style={{ 
            padding: '8px 16px', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            background: filter === 'confirmed' ? '#3498db' : '#ecf0f1',
            color: filter === 'confirmed' ? 'white' : '#333'
          }}
        >
          Confirmed ({bookingStats.confirmed})
        </button>
        <button 
          onClick={() => setFilter('processing')} 
          style={{ 
            padding: '8px 16px', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            background: filter === 'processing' ? '#9b59b6' : '#ecf0f1',
            color: filter === 'processing' ? 'white' : '#333'
          }}
        >
          Processing ({bookingStats.processing})
        </button>
        <button 
          onClick={() => setFilter('delivered')} 
          style={{ 
            padding: '8px 16px', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            background: filter === 'delivered' ? '#27ae60' : '#ecf0f1',
            color: filter === 'delivered' ? 'white' : '#333'
          }}
        >
          Delivered ({bookingStats.delivered})
        </button>
        <button 
          onClick={() => setFilter('cancelled')} 
          style={{ 
            padding: '8px 16px', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            background: filter === 'cancelled' ? '#e74c3c' : '#ecf0f1',
            color: filter === 'cancelled' ? 'white' : '#333'
          }}
        >
          Cancelled ({bookingStats.cancelled})
        </button>
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Customer Details</th>
              <th>Furniture</th>
              <th>Qty</th>
              <th>Total</th>
              <th>Booking Date</th>
              <th>Delivery Date</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map(booking => (
              <tr key={booking._id}>
                <td>
                  <strong>#{booking._id.slice(-6).toUpperCase()}</strong>
                  <br />
                  <small style={{ color: '#888' }}>
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </small>
                </td>
                <td>
                  <div style={{ fontWeight: 'bold' }}>{booking.user?.name || 'N/A'}</div>
                  <small style={{ color: '#666' }}>📧 {booking.user?.email || 'N/A'}</small>
                  {booking.user?.phone && (
                    <div><small style={{ color: '#666' }}>📞 {booking.user.phone}</small></div>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {booking.furniture?.images?.[0] && (
                      <img 
                        src={booking.furniture.images[0]} 
                        alt={booking.furniture.name}
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{booking.furniture?.name || 'N/A'}</div>
                      {booking.furniture?.category?.name && (
                        <small style={{ color: '#888' }}>{booking.furniture.category.name}</small>
                      )}
                    </div>
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span style={{ 
                    background: '#ecf0f1', 
                    padding: '4px 10px', 
                    borderRadius: '4px',
                    fontWeight: 'bold'
                  }}>
                    {booking.quantity}
                  </span>
                </td>
                <td>
                  <strong style={{ color: '#27ae60', fontSize: '16px' }}>
                    ${booking.totalPrice?.toLocaleString()}
                  </strong>
                  <br />
                  <small style={{ color: '#888' }}>
                    ${(booking.totalPrice / booking.quantity).toFixed(2)}/unit
                  </small>
                </td>
                <td>
                  <div>{new Date(booking.bookingDate || booking.createdAt).toLocaleDateString()}</div>
                  <small style={{ color: '#888' }}>
                    {new Date(booking.bookingDate || booking.createdAt).toLocaleTimeString()}
                  </small>
                </td>
                <td>
                  <div style={{ fontWeight: 'bold' }}>
                    {new Date(booking.deliveryDate).toLocaleDateString()}
                  </div>
                  <small style={{ color: '#888' }}>
                    {Math.ceil((new Date(booking.deliveryDate) - new Date()) / (1000 * 60 * 60 * 24))} days
                  </small>
                </td>
                <td>
                  <select
                    value={booking.status}
                    onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '4px',
                      border: 'none',
                      background: getStatusColor(booking.status),
                      color: 'white',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td>
                  <select
                    value={booking.paymentStatus}
                    onChange={(e) => handlePaymentStatusChange(booking._id, e.target.value)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '4px',
                      border: 'none',
                      background: getPaymentColor(booking.paymentStatus),
                      color: 'white',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                  </select>
                </td>
                <td>
                  <button
                    onClick={() => setSelectedBooking(selectedBooking?._id === booking._id ? null : booking)}
                    style={{
                      padding: '6px 12px',
                      background: '#3498db',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {selectedBooking?._id === booking._id ? 'Hide' : 'View'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredBookings.length === 0 && (
          <div className="no-data">
            <p>No bookings found for this filter.</p>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>📦 Booking Details</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                style={{
                  background: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                <strong>Booking ID</strong>
                <div>#{selectedBooking._id.slice(-6).toUpperCase()}</div>
              </div>
              <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                <strong>Created At</strong>
                <div>{new Date(selectedBooking.createdAt).toLocaleString()}</div>
              </div>
              <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                <strong>Customer Name</strong>
                <div>{selectedBooking.user?.name || 'N/A'}</div>
              </div>
              <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                <strong>Customer Email</strong>
                <div>{selectedBooking.user?.email || 'N/A'}</div>
              </div>
              <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                <strong>Customer Phone</strong>
                <div>{selectedBooking.user?.phone || 'N/A'}</div>
              </div>
              <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                <strong>Furniture</strong>
                <div>{selectedBooking.furniture?.name || 'N/A'}</div>
              </div>
              <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                <strong>Quantity</strong>
                <div>{selectedBooking.quantity}</div>
              </div>
              <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                <strong>Unit Price</strong>
                <div>₹{(selectedBooking.totalPrice / selectedBooking.quantity).toLocaleString()}</div>
              </div>
              <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px' }}>
                <strong>Total Price</strong>
                <div style={{ fontSize: '20px', color: '#27ae60', fontWeight: 'bold' }}>
                  ₹{selectedBooking.totalPrice?.toLocaleString()}
                </div>
              </div>
              <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                <strong>Booking Date</strong>
                <div>{new Date(selectedBooking.bookingDate || selectedBooking.createdAt).toLocaleString()}</div>
              </div>
              <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '8px', gridColumn: '1 / -1' }}>
                <strong>Delivery Date</strong>
                <div style={{ fontSize: '18px' }}>
                  {new Date(selectedBooking.deliveryDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
              <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', gridColumn: '1 / -1' }}>
                <strong>📍 Delivery Address</strong>
                <div style={{ marginTop: '5px' }}>{selectedBooking.deliveryAddress}</div>
              </div>
              {selectedBooking.notes && (
                <div style={{ background: '#fef9e7', padding: '15px', borderRadius: '8px', gridColumn: '1 / -1' }}>
                  <strong>📝 Notes</strong>
                  <div style={{ marginTop: '5px' }}>{selectedBooking.notes}</div>
                </div>
              )}
              <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                <strong>Status</strong>
                <div style={{ 
                  display: 'inline-block',
                  marginTop: '5px',
                  padding: '4px 12px', 
                  background: getStatusColor(selectedBooking.status), 
                  color: 'white', 
                  borderRadius: '4px',
                  fontWeight: 'bold'
                }}>
                  {selectedBooking.status.toUpperCase()}
                </div>
              </div>
              <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                <strong>Payment Status</strong>
                <div style={{ 
                  display: 'inline-block',
                  marginTop: '5px',
                  padding: '4px 12px', 
                  background: getPaymentColor(selectedBooking.paymentStatus), 
                  color: 'white', 
                  borderRadius: '4px',
                  fontWeight: 'bold'
                }}>
                  {selectedBooking.paymentStatus.toUpperCase()}
                </div>
              </div>
              {selectedBooking.updatedAt && (
                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', gridColumn: '1 / -1' }}>
                  <strong>Last Updated</strong>
                  <div>{new Date(selectedBooking.updatedAt).toLocaleString()}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBookings;
