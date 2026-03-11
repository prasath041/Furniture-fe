import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import './OrderSuccess.css';

const OrderSuccess = () => {
  return (
    <div className="order-success-page">
      <div className="success-container">
        <FaCheckCircle className="success-icon" />
        <h1>Order Placed Successfully!</h1>
        <p className="success-message">
          Thank you for your purchase. Your order has been confirmed and will be delivered soon.
        </p>
        <p className="order-note">
          You will receive an email confirmation with your order details.
        </p>
        
        <div className="success-actions">
          <Link to="/my-bookings" className="btn-view-orders">
            View My Orders
          </Link>
          <Link to="/products" className="btn-continue">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
