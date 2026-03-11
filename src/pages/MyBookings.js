import React, { useState, useEffect } from 'react';
import { bookingAPI } from '../services/api';
import './MyBookings.css';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getUserBookings();
      setBookings(response.data.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await bookingAPI.cancel(id);
      alert('Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const getStatusClass = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      processing: 'status-processing',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled'
    };
    return statusClasses[status] || '';
  };

  if (loading) return <div className="loading">Loading bookings...</div>;

  return (
    <div className="my-bookings">
      <h1>My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="no-bookings">
          <p>You haven't made any bookings yet.</p>
          <a href="/products" className="btn-primary">Browse Products</a>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking._id} className="booking-card">
              <div className="booking-image">
                <img 
                  src={booking.furniture?.images?.[0] || 'https://via.placeholder.com/150'} 
                  alt={booking.furniture?.name} 
                />
              </div>

              <div className="booking-details">
                <h3>{booking.furniture?.name}</h3>
                <p>Quantity: {booking.quantity}</p>
                <p>Total Price: ₹{booking.totalPrice?.toLocaleString()}</p>
                <p>Delivery Date: {new Date(booking.deliveryDate).toLocaleDateString()}</p>
                <p>Delivery Address: {booking.deliveryAddress}</p>
                <p>Booking Date: {new Date(booking.bookingDate).toLocaleDateString()}</p>
                
                <div className="booking-status">
                  <span className={`status-badge ${getStatusClass(booking.status)}`}>
                    {booking.status.toUpperCase()}
                  </span>
                  <span className={`payment-badge ${booking.paymentStatus === 'paid' ? 'paid' : 'unpaid'}`}>
                    Payment: {booking.paymentStatus.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="booking-actions">
                {booking.status !== 'delivered' && booking.status !== 'cancelled' && (
                  <button 
                    onClick={() => handleCancel(booking._id)} 
                    className="btn-cancel"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
