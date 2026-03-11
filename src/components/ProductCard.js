import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FaShoppingCart, FaCheck, FaCalendarAlt, FaDoorOpen, FaWindowMaximize, FaLock } from 'react-icons/fa';
import './ProductCard.css';

// Sample furniture images for demo
const sampleImages = [
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
  'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400',
  'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400',
  'https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?w=400',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'
];

// Door images - fallback images
const doorFallbackImages = [
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
  'https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?w=400',
  'https://images.unsplash.com/photo-1517142089942-ba376ce32a2e?w=400'
];

// Window images - placeholder for windows without uploaded images
const windowImages = [
  '/assets/windows/sal window.jpg'
];

// Locker images
const lockerImages = [
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
  'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400',
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400'
];

const ProductCard = ({ furniture, index = 0 }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [addedToCart, setAddedToCart] = useState(false);
  const [imageError, setImageError] = useState(false);

  const productType = furniture.productType || 'furniture';
  
  const getFallbackImage = () => {
    if (productType === 'door') return doorFallbackImages[index % doorFallbackImages.length];
    if (productType === 'window') return windowImages[index % windowImages.length];
    if (productType === 'locker') return lockerImages[index % lockerImages.length];
    return sampleImages[index % sampleImages.length];
  };

  const getImageUrl = () => {
    if (imageError) return getFallbackImage();
    
    let imgUrl = null;
    if (furniture.image) {
      imgUrl = furniture.image;
    } else if (furniture.images && furniture.images.length > 0) {
      imgUrl = furniture.images[0];
    }
    
    if (imgUrl) {
      // If it's already a full URL, return as is
      if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
        return imgUrl;
      }
      // If it's a path to public assets, serve from frontend
      if (imgUrl.startsWith('/assets/')) {
        return imgUrl;
      }
      // If it's a relative path (uploads), prepend backend URL
      return `http://localhost:5000${imgUrl}`;
    }
    
    return getFallbackImage();
  };

  const imageUrl = getImageUrl();

  const handleImageError = () => {
    setImageError(true);
  };

  const getDetailLink = () => {
    if (productType === 'door') return `/products/door/${furniture._id}`;
    if (productType === 'window') return `/products/window/${furniture._id}`;
    if (productType === 'locker') return `/products/locker/${furniture._id}`;
    return `/products/${furniture._id}`;
  };

  const getBookingLink = () => {
    if (productType === 'door') return `/booking/door/${furniture._id}`;
    if (productType === 'window') return `/booking/window/${furniture._id}`;
    if (productType === 'locker') return `/booking/locker/${furniture._id}`;
    return `/booking/${furniture._id}`;
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ ...furniture, productType }, 1);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBookNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(getBookingLink());
  };

  const getProductTypeBadge = () => {
    if (productType === 'door') return <span className="product-type-badge door"><FaDoorOpen /> Door</span>;
    if (productType === 'window') return <span className="product-type-badge window"><FaWindowMaximize /> Window</span>;
    if (productType === 'locker') return <span className="product-type-badge locker"><FaLock /> Locker</span>;
    return null;
  };

  return (
    <div className={`product-card ${productType}-card`}>
      <div className="product-image">
        <img src={imageUrl} alt={furniture.name} onError={handleImageError} />
        {getProductTypeBadge()}
        {!furniture.isAvailable && <span className="badge-out-of-stock">Out of Stock</span>}
        {furniture.stock <= 5 && furniture.stock > 0 && (
          <span className="badge-low-stock">Only {furniture.stock} left</span>
        )}
      </div>
      
      <div className="product-info">
        <h3>{furniture.name}</h3>
        <p className="product-category">
          {furniture.category?.name || furniture.woodType?.name || furniture.productType || furniture.material || 'Premium Quality'}
        </p>
        <p className="product-description">
          {furniture.description?.substring(0, 80)}...
        </p>
        
        <div className="product-footer">
          <span className="product-price">₹{furniture.price?.toLocaleString()}</span>
          <div className="product-buttons">
            {(furniture.isAvailable !== false) && (furniture.stock === undefined || furniture.stock > 0) && (
              <>
                <button 
                  onClick={handleAddToCart} 
                  className={`btn-cart ${addedToCart ? 'added' : ''}`}
                  title="Add to Cart"
                >
                  {addedToCart ? <FaCheck /> : <FaShoppingCart />}
                </button>
                <button 
                  onClick={handleBookNow} 
                  className="btn-book"
                  title="Book Now"
                >
                  <FaCalendarAlt />
                </button>
              </>
            )}
            <Link to={getDetailLink()} className="btn-view">
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
