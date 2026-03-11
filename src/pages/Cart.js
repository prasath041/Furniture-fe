import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getProductImage } from '../utils/imageUtils';
import { FaTrash, FaPlus, FaMinus, FaShoppingBag } from 'react-icons/fa';
import './Cart.css';

const Cart = () => {
  const { cartItems, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      alert('Please login to proceed with checkout');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="empty-cart">
          <FaShoppingBag className="empty-cart-icon" />
          <h2>Your Cart is Empty</h2>
          <p>Looks like you haven't added any furniture yet!</p>
          <Link to="/products" className="btn-primary">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Shopping Cart</h1>
      
      <div className="cart-container">
        <div className="cart-items">
          {cartItems.map(item => (
            <div key={item._id} className="cart-item">
              <div className="cart-item-image">
                <img 
                  src={getProductImage(item, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300')} 
                  alt={item.name} 
                />
              </div>
              
              <div className="cart-item-details">
                <h3>{item.name}</h3>
                <p className="item-category">{item.category?.name}</p>
                <p className="item-price">₹{item.price?.toLocaleString()}</p>
              </div>
              
              <div className="cart-item-quantity">
                <button 
                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                  className="qty-btn"
                >
                  <FaMinus />
                </button>
                <span className="qty-value">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  className="qty-btn"
                  disabled={item.quantity >= item.stock}
                >
                  <FaPlus />
                </button>
              </div>
              
              <div className="cart-item-total">
                <p>₹{(item.price * item.quantity).toLocaleString()}</p>
              </div>
              
              <button 
                onClick={() => removeFromCart(item._id)} 
                className="btn-remove"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{cartTotal.toLocaleString()}</span>
          </div>
          
          <div className="summary-row">
            <span>Shipping</span>
            <span>{cartTotal >= 500 ? 'FREE' : '₹50'}</span>
          </div>
          
          <div className="summary-row">
            <span>Tax (10%)</span>
            <span>₹{(cartTotal * 0.1).toLocaleString()}</span>
          </div>
          
          <div className="summary-total">
            <span>Total</span>
            <span>₹{(cartTotal + (cartTotal >= 500 ? 0 : 50) + (cartTotal * 0.1)).toLocaleString()}</span>
          </div>

          <button onClick={handleCheckout} className="btn-checkout">
            Proceed to Checkout
          </button>
          
          <button onClick={clearCart} className="btn-clear-cart">
            Clear Cart
          </button>
          
          <Link to="/products" className="continue-shopping">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
