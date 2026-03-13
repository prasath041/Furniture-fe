import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { bookingAPI } from '../services/api';
import { getProductImage } from '../utils/imageUtils';
import { FaCreditCard, FaPaypal, FaMoneyBillWave, FaLock } from 'react-icons/fa';
import './Checkout.css';

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA'
  });
  
  const [paymentInfo, setPaymentInfo] = useState({
    method: 'card',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  const shipping = cartTotal >= 500 ? 0 : 50;
  const tax = cartTotal * 0.1;
  const total = cartTotal + shipping + tax;

  const handleShippingChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  const handlePaymentChange = (e) => {
    setPaymentInfo({ ...paymentInfo, [e.target.name]: e.target.value });
  };

  const validateShipping = () => {
    const required = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
    for (let field of required) {
      if (!shippingInfo[field]) {
        setError(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    setError('');
    return true;
  };

  const validatePayment = () => {
    if (paymentInfo.method === 'card') {
      if (!paymentInfo.cardNumber || !paymentInfo.cardName || !paymentInfo.expiryDate || !paymentInfo.cvv) {
        setError('Please fill in all card details');
        return false;
      }
    }
    setError('');
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateShipping()) {
      setStep(2);
    } else if (step === 2 && validatePayment()) {
      setStep(3);
    }
  };

  const getProductModelName = (type) => {
    const map = { door: 'Door', window: 'Window', locker: 'Locker', furniture: 'Furniture' };
    return map[type] || 'Furniture';
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');

    try {
      // Create bookings for each cart item
      for (const item of cartItems) {
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 7); // 7 days delivery

        await bookingAPI.create({
          furniture: item._id,
          productType: getProductModelName(item.productType),
          quantity: item.quantity,
          deliveryDate: deliveryDate.toISOString(),
          deliveryAddress: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}, ${shippingInfo.country}`,
          notes: `Payment Method: ${paymentInfo.method}`
        });
      }

      clearCart();
      navigate('/order-success');
    } catch (err) {
      setError(err.response?.data?.message || 'Order placement failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      {/* Progress Steps */}
      <div className="checkout-steps">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>
          <span className="step-number">1</span>
          <span className="step-label">Shipping</span>
        </div>
        <div className={`step ${step >= 2 ? 'active' : ''}`}>
          <span className="step-number">2</span>
          <span className="step-label">Payment</span>
        </div>
        <div className={`step ${step >= 3 ? 'active' : ''}`}>
          <span className="step-number">3</span>
          <span className="step-label">Review</span>
        </div>
      </div>

      <div className="checkout-container">
        <div className="checkout-form">
          {error && <div className="error-message">{error}</div>}

          {/* Step 1: Shipping */}
          {step === 1 && (
            <div className="shipping-form">
              <h2>Shipping Information</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={shippingInfo.fullName}
                    onChange={handleShippingChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={shippingInfo.email}
                    onChange={handleShippingChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={shippingInfo.phone}
                  onChange={handleShippingChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={shippingInfo.address}
                  onChange={handleShippingChange}
                  placeholder="Street address"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleShippingChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    name="state"
                    value={shippingInfo.state}
                    onChange={handleShippingChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>ZIP Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={shippingInfo.zipCode}
                    onChange={handleShippingChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <select name="country" value={shippingInfo.country} onChange={handleShippingChange}>
                    <option value="USA">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="India">India</option>
                  </select>
                </div>
              </div>

              <button onClick={handleNextStep} className="btn-next">
                Continue to Payment
              </button>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="payment-form">
              <h2>Payment Method</h2>

              <div className="payment-methods">
                <label className={`payment-option ${paymentInfo.method === 'card' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="method"
                    value="card"
                    checked={paymentInfo.method === 'card'}
                    onChange={handlePaymentChange}
                  />
                  <FaCreditCard /> Credit/Debit Card
                </label>
                
                <label className={`payment-option ${paymentInfo.method === 'paypal' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="method"
                    value="paypal"
                    checked={paymentInfo.method === 'paypal'}
                    onChange={handlePaymentChange}
                  />
                  <FaPaypal /> PayPal
                </label>
                
                <label className={`payment-option ${paymentInfo.method === 'cod' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="method"
                    value="cod"
                    checked={paymentInfo.method === 'cod'}
                    onChange={handlePaymentChange}
                  />
                  <FaMoneyBillWave /> Cash on Delivery
                </label>
              </div>

              {paymentInfo.method === 'card' && (
                <div className="card-details">
                  <div className="form-group">
                    <label>Card Number</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={paymentInfo.cardNumber}
                      onChange={handlePaymentChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                    />
                  </div>

                  <div className="form-group">
                    <label>Name on Card</label>
                    <input
                      type="text"
                      name="cardName"
                      value={paymentInfo.cardName}
                      onChange={handlePaymentChange}
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={paymentInfo.expiryDate}
                        onChange={handlePaymentChange}
                        placeholder="MM/YY"
                        maxLength="5"
                      />
                    </div>
                    <div className="form-group">
                      <label>CVV</label>
                      <input
                        type="password"
                        name="cvv"
                        value={paymentInfo.cvv}
                        onChange={handlePaymentChange}
                        placeholder="***"
                        maxLength="4"
                      />
                    </div>
                  </div>

                  <div className="secure-note">
                    <FaLock /> Your payment information is secure
                  </div>
                </div>
              )}

              {paymentInfo.method === 'paypal' && (
                <div className="paypal-note">
                  <p>You will be redirected to PayPal to complete your payment.</p>
                </div>
              )}

              {paymentInfo.method === 'cod' && (
                <div className="cod-note">
                  <p>Pay with cash when your order is delivered.</p>
                  <p className="cod-fee">Additional fee: $10.00</p>
                </div>
              )}

              <div className="form-buttons">
                <button onClick={() => setStep(1)} className="btn-back">
                  Back
                </button>
                <button onClick={handleNextStep} className="btn-next">
                  Review Order
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="review-order">
              <h2>Review Your Order</h2>

              <div className="review-section">
                <h3>Shipping Address</h3>
                <p>{shippingInfo.fullName}</p>
                <p>{shippingInfo.address}</p>
                <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
                <p>{shippingInfo.country}</p>
                <p>Phone: {shippingInfo.phone}</p>
              </div>

              <div className="review-section">
                <h3>Payment Method</h3>
                <p>
                  {paymentInfo.method === 'card' && `Credit Card ending in ${paymentInfo.cardNumber.slice(-4)}`}
                  {paymentInfo.method === 'paypal' && 'PayPal'}
                  {paymentInfo.method === 'cod' && 'Cash on Delivery'}
                </p>
              </div>

              <div className="review-section">
                <h3>Order Items</h3>
                {cartItems.map(item => (
                  <div key={item._id} className="review-item">
                    <img src={getProductImage(item, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100')} alt={item.name} />
                    <div>
                      <p className="item-name">{item.name}</p>
                      <p className="item-qty">Qty: {item.quantity}</p>
                    </div>
                    <p className="item-total">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="form-buttons">
                <button onClick={() => setStep(2)} className="btn-back">
                  Back
                </button>
                <button 
                  onClick={handlePlaceOrder} 
                  className="btn-place-order"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : `Place Order - ₹${total.toLocaleString()}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="order-summary">
          <h2>Order Summary</h2>
          
          <div className="summary-items">
            {cartItems.map(item => (
              <div key={item._id} className="summary-item">
                <span>{item.name} × {item.quantity}</span>
                <span>₹{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{cartTotal.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString()}`}</span>
            </div>
            <div className="summary-row">
              <span>Tax (10%)</span>
              <span>₹{tax.toLocaleString()}</span>
            </div>
            {paymentInfo.method === 'cod' && (
              <div className="summary-row">
                <span>COD Fee</span>
                <span>₹10</span>
              </div>
            )}
            <div className="summary-total">
              <span>Total</span>
              <span>₹{(total + (paymentInfo.method === 'cod' ? 10 : 0)).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
