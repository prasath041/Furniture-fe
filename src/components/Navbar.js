import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FaShoppingCart, FaUser, FaSignOutAlt, FaClipboardList, FaDoorOpen, FaWindowMaximize, FaCouch, FaTruck, FaStore } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const isShopkeeper = user?.role === 'shopkeeper';
  const isDeliveryAgent = user?.role === 'delivery_agent';

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img 
            src="/assets/images/logo.png" 
            alt="Sri Vasantham Timbers" 
            className="logo-image"
          />
          Sri Vasantham Timbers
        </Link>
        
        <ul className="navbar-menu">
          <li><Link to="/">Home</Link></li>
          
          {/* Products Dropdown */}
          <li 
            className="products-dropdown"
            onMouseEnter={() => setProductsDropdownOpen(true)}
            onMouseLeave={() => setProductsDropdownOpen(false)}
          >
            <Link to="/products" className="products-link">Products</Link>
            {productsDropdownOpen && (
              <div className="products-dropdown-content">
                <Link to="/products?type=doors" className="dropdown-item door-item">
                  <FaDoorOpen /> Wood Doors
                </Link>
                <Link to="/products?type=windows" className="dropdown-item window-item">
                  <FaWindowMaximize /> Wood Windows
                </Link>
                <Link to="/products?type=furniture" className="dropdown-item furniture-item">
                  <FaCouch /> Furniture
                </Link>
                <Link to="/products" className="dropdown-item all-item">
                  View All Products
                </Link>
              </div>
            )}
          </li>
          
          {/* Cart Icon - Always visible */}
          <li>
            <Link to="/cart" className="cart-link">
              <FaShoppingCart />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          </li>
          
          {isAuthenticated ? (
            <>
              <li><Link to="/my-bookings"><FaClipboardList /> My Orders</Link></li>
              {isShopkeeper && <li><Link to="/shopkeeper"><FaStore /> Shopkeeper</Link></li>}
              {isDeliveryAgent && <li><Link to="/delivery"><FaTruck /> Deliveries</Link></li>}
              {isAdmin && <li><Link to="/admin">Admin</Link></li>}
              <li className="dropdown">
                <button className="dropdown-btn" onClick={toggleDropdown}>
                  <FaUser /> {user?.name}
                </button>
                {dropdownOpen && (
                  <div className="dropdown-content show">
                    <Link to="/profile" onClick={closeDropdown}>Profile</Link>
                    <button onClick={handleLogout} className="logout-btn">
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                )}
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register" className="btn-register">Register</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
