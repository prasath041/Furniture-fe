import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { furnitureAPI, categoryAPI, doorAPI, windowAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { getProductImage } from '../utils/imageUtils';
import { FaShoppingCart, FaCheck, FaDoorOpen, FaWindowMaximize, FaCouch, FaArrowRight } from 'react-icons/fa';
import './Home.css';

// Sample furniture images for demo
const sampleImages = [
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
  'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400',
  'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400',
  'https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?w=400',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'
];

// Door images
const doorImages = [
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
  'https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?w=400',
  'https://images.unsplash.com/photo-1517142089942-ba376ce32a2e?w=400'
];

// Window images - placeholder for windows without uploaded images
const windowImages = [
  '/assets/windows/sal window.jpg'
];

// Category images
const categoryImages = [
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300',
  'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=300',
  'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=300',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=300'
];

const Home = () => {
  const [featuredFurniture, setFeaturedFurniture] = useState([]);
  const [featuredDoors, setFeaturedDoors] = useState([]);
  const [featuredWindows, setFeaturedWindows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedProducts, setAddedProducts] = useState({});
  const { addToCart } = useCart();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [furnitureRes, categoryRes, doorsRes, windowsRes] = await Promise.all([
        furnitureAPI.getAll(),
        categoryAPI.getAll(),
        doorAPI.getAll(),
        windowAPI.getAll()
      ]);
      
      setFeaturedFurniture(furnitureRes.data.data.slice(0, 4));
      setCategories(categoryRes.data.data);
      setFeaturedDoors(doorsRes.data.data.slice(0, 3));
      setFeaturedWindows(windowsRes.data.data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product, type = 'furniture') => {
    addToCart({ ...product, productType: type }, 1);
    const key = `${type}-${product._id}`;
    setAddedProducts(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setAddedProducts(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Sri Vasantham Trimbers</h1>
          <p>Premium Wood Doors, Windows & Quality Furniture</p>
          <div className="hero-buttons">
            <Link to="/products?type=doors" className="btn-primary">
              <FaDoorOpen /> View Doors
            </Link>
            <Link to="/products?type=windows" className="btn-primary btn-secondary-hero">
              <FaWindowMaximize /> View Windows
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Category Cards */}
      <section className="quick-categories">
        <div className="quick-category-card doors">
          <div className="quick-category-icon">
            <FaDoorOpen />
          </div>
          <h3>Wood Doors</h3>
          <p>Premium quality wooden doors for your home</p>
          <Link to="/products?type=doors" className="quick-link">
            Explore Doors <FaArrowRight />
          </Link>
        </div>
        <div className="quick-category-card windows">
          <div className="quick-category-icon">
            <FaWindowMaximize />
          </div>
          <h3>Wood Windows</h3>
          <p>Beautiful wooden windows with fine craftsmanship</p>
          <Link to="/products?type=windows" className="quick-link">
            Explore Windows <FaArrowRight />
          </Link>
        </div>
        <div className="quick-category-card furniture">
          <div className="quick-category-icon">
            <FaCouch />
          </div>
          <h3>Furniture</h3>
          <p>Quality furniture for every room</p>
          <Link to="/products?type=furniture" className="quick-link">
            Explore Furniture <FaArrowRight />
          </Link>
        </div>
      </section>

      {/* Featured Wood Doors Section */}
      <section className="featured-section featured-doors">
        <div className="section-header">
          <h2><FaDoorOpen /> Featured Wood Doors</h2>
          <Link to="/products?type=doors" className="view-all-link">
            View All Doors <FaArrowRight />
          </Link>
        </div>
        <div className="featured-grid">
          {featuredDoors.length > 0 ? (
            featuredDoors.map((door, index) => (
              <div key={door._id} className="featured-card door-card">
                <div className="featured-badge">Popular</div>
                <img src={getProductImage(door, doorImages[index % doorImages.length])} alt={door.name} />
                <div className="featured-card-content">
                  <h3>{door.name}</h3>
                  <p className="product-material">{door.woodType?.name || 'Premium Wood'}</p>
                  <p className="price">₹{door.price?.toLocaleString()}</p>
                  <div className="featured-actions">
                    <button 
                      onClick={() => handleAddToCart(door, 'door')} 
                      className={`btn-cart ${addedProducts[`door-${door._id}`] ? 'added' : ''}`}
                    >
                      {addedProducts[`door-${door._id}`] ? <FaCheck /> : <FaShoppingCart />}
                    </button>
                    <Link to={`/products/door/${door._id}`} className="btn-view">View Details</Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="no-products">No doors available yet. Check back soon!</p>
          )}
        </div>
      </section>

      {/* Featured Wood Windows Section */}
      <section className="featured-section featured-windows">
        <div className="section-header">
          <h2><FaWindowMaximize /> Featured Wood Windows</h2>
          <Link to="/products?type=windows" className="view-all-link">
            View All Windows <FaArrowRight />
          </Link>
        </div>
        <div className="featured-grid">
          {featuredWindows.length > 0 ? (
            featuredWindows.map((window, index) => (
              <div key={window._id} className="featured-card window-card">
                <div className="featured-badge window-badge">Trending</div>
                <img src={getProductImage(window, windowImages[index % windowImages.length])} alt={window.name} />
                <div className="featured-card-content">
                  <h3>{window.name}</h3>
                  <p className="product-material">{window.woodType?.name || 'Premium Wood'}</p>
                  <p className="price">₹{window.price?.toLocaleString()}</p>
                  <div className="featured-actions">
                    <button 
                      onClick={() => handleAddToCart(window, 'window')} 
                      className={`btn-cart ${addedProducts[`window-${window._id}`] ? 'added' : ''}`}
                    >
                      {addedProducts[`window-${window._id}`] ? <FaCheck /> : <FaShoppingCart />}
                    </button>
                    <Link to={`/products/window/${window._id}`} className="btn-view">View Details</Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="no-products">No windows available yet. Check back soon!</p>
          )}
        </div>
      </section>

      {/* Featured Furniture Products */}
      <section className="featured-section featured-furniture">
        <div className="section-header">
          <h2><FaCouch /> Featured Furniture</h2>
          <Link to="/products?type=furniture" className="view-all-link">
            View All Furniture <FaArrowRight />
          </Link>
        </div>
        <div className="products-grid">
          {featuredFurniture.map((product, index) => (
            <div key={product._id} className="product-card">
              <img src={getProductImage(product, sampleImages[index % sampleImages.length])} alt={product.name} />
              <h3>{product.name}</h3>
              <p className="price">₹{product.price?.toLocaleString()}</p>
              <div className="product-actions">
                <button 
                  onClick={() => handleAddToCart(product, 'furniture')} 
                  className={`btn-cart ${addedProducts[`furniture-${product._id}`] ? 'added' : ''}`}
                >
                  {addedProducts[`furniture-${product._id}`] ? <FaCheck /> : <FaShoppingCart />}
                </button>
                <Link to={`/products/${product._id}`} className="btn-secondary">View Details</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="feature">
          <h3>🚚 Free Delivery</h3>
          <p>On orders over $500</p>
        </div>
        <div className="feature">
          <h3>🔒 Secure Payment</h3>
          <p>100% secure transactions</p>
        </div>
        <div className="feature">
          <h3>🎯 Quality Products</h3>
          <p>Premium furniture selection</p>
        </div>
        <div className="feature">
          <h3>💬 24/7 Support</h3>
          <p>Always here to help</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
