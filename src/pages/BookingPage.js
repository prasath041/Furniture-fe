import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { furnitureAPI, bookingAPI, doorAPI, windowAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getProductImage } from '../utils/imageUtils';
import { FaDoorOpen, FaWindowMaximize, FaCouch } from 'react-icons/fa';
import './BookingPage.css';

// Default images
const defaultImages = {
  furniture: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
  door: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
  window: 'https://images.unsplash.com/photo-1509644851169-2acc08aa25b5?w=400'
};

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [productType, setProductType] = useState('furniture');
  
  const [bookingData, setBookingData] = useState({
    quantity: 1,
    deliveryDate: '',
    deliveryAddress: user?.address || '',
    notes: ''
  });

  // Determine product type from URL
  useEffect(() => {
    if (location.pathname.includes('/door/')) {
      setProductType('door');
    } else if (location.pathname.includes('/window/')) {
      setProductType('window');
    } else {
      setProductType('furniture');
    }
  }, [location.pathname]);

  useEffect(() => {
    fetchProduct();
  }, [id, productType]);

  const fetchProduct = async () => {
    try {
      let response;
      if (productType === 'door') {
        response = await doorAPI.getById(id);
      } else if (productType === 'window') {
        response = await windowAPI.getById(id);
      } else {
        response = await furnitureAPI.getById(id);
      }
      setProduct({ ...response.data.data, productType });
      
      // Set minimum delivery date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const minDate = tomorrow.toISOString().split('T')[0];
      setBookingData(prev => ({ ...prev, deliveryDate: minDate }));
    } catch (error) {
      setError('Error loading product');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const bookingPayload = {
        furniture: id,
        productType: productType,
        ...bookingData,
        quantity: parseInt(bookingData.quantity)
      };

      await bookingAPI.create(bookingPayload);
      alert('Booking successful!');
      navigate('/my-bookings');
    } catch (error) {
      setError(error.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  const getProductTypeIcon = () => {
    switch (productType) {
      case 'door': return <FaDoorOpen />;
      case 'window': return <FaWindowMaximize />;
      default: return <FaCouch />;
    }
  };

  const getProductTypeLabel = () => {
    switch (productType) {
      case 'door': return 'Wood Door';
      case 'window': return 'Wood Window';
      default: return 'Furniture';
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!product) return <div className="error">Product not found</div>;

  const totalPrice = product.price * bookingData.quantity;

  return (
    <div className={`booking-page ${productType}-booking`}>
      <h1>{getProductTypeIcon()} Book Your {getProductTypeLabel()}</h1>
      
      <div className="booking-container">
        {/* Product Summary */}
        <div className={`product-summary ${productType}-summary`}>
          <img src={getProductImage(product, defaultImages[productType])} alt={product.name} />
          <div>
            <span className={`product-type-badge ${productType}`}>
              {getProductTypeIcon()} {getProductTypeLabel()}
            </span>
            <h3>{product.name}</h3>
            <p>Price: ₹{product.price?.toLocaleString()}</p>
            {product.stock !== undefined && <p>Available Stock: {product.stock}</p>}
            {product.woodType && <p>Wood Type: {product.woodType.name}</p>}
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="booking-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              name="quantity"
              min="1"
              max={product.stock || 100}
              value={bookingData.quantity}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Delivery Date</label>
            <input
              type="date"
              name="deliveryDate"
              value={bookingData.deliveryDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group">
            <label>Delivery Address</label>
            <textarea
              name="deliveryAddress"
              value={bookingData.deliveryAddress}
              onChange={handleChange}
              rows="3"
              required
            />
          </div>

          <div className="form-group">
            <label>Additional Notes (Optional)</label>
            <textarea
              name="notes"
              value={bookingData.notes}
              onChange={handleChange}
              rows="3"
              placeholder={productType !== 'furniture' ? 'Specify custom dimensions, color preferences, etc.' : ''}
            />
          </div>

          <div className="booking-summary">
            <h3>Booking Summary</h3>
            <p>Product: {product.name}</p>
            <p>Type: {getProductTypeLabel()}</p>
            <p>Quantity: {bookingData.quantity}</p>
            <p>Price per item: ₹{product.price?.toLocaleString()}</p>
            <p className="total">Total: ₹{totalPrice?.toLocaleString()}</p>
          </div>

          <button type="submit" className={`btn-submit ${productType}-btn`} disabled={submitting}>
            {submitting ? 'Processing...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingPage;
