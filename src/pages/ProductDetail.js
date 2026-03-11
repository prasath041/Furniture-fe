import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { furnitureAPI, doorAPI, windowAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FaShoppingCart, FaCheck, FaDoorOpen, FaWindowMaximize } from 'react-icons/fa';
import './ProductDetail.css';

// Sample furniture images for demo
const sampleImages = [
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600',
  'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600',
  'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600'
];

// Door images
const doorImages = [
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
  'https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?w=600',
  'https://images.unsplash.com/photo-1517142089942-ba376ce32a2e?w=600'
];

// Window images
const windowImages = [
  '/assets/windows/sal window.jpg'
];

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { addToCart, cartItems } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [productType, setProductType] = useState('furniture');

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

  const isInCart = cartItems.some(item => item._id === product?._id && item.productType === productType);

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
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart({ ...product, productType }, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart({ ...product, productType }, quantity);
    navigate('/cart');
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (productType === 'door') {
      navigate(`/booking/door/${id}`);
    } else if (productType === 'window') {
      navigate(`/booking/window/${id}`);
    } else {
      navigate(`/booking/${id}`);
    }
  };

  const getDefaultImages = () => {
    if (productType === 'door') return doorImages;
    if (productType === 'window') return windowImages;
    return sampleImages;
  };

  const formatImageUrl = (imgUrl) => {
    if (!imgUrl || imgUrl.trim() === '') return null;
    if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
      return imgUrl;
    }
    
    if (imgUrl.startsWith('/assets/')) {
      return imgUrl;
    }
   
    return `http://localhost:5000${imgUrl}`;
  };

  
  const getProductImages = () => {
    const productImages = [];
    

    if (product.image && product.image.trim() !== '') {
      const formattedUrl = formatImageUrl(product.image);
      if (formattedUrl) productImages.push(formattedUrl);
    }
    
    // Add images array if exists
    if (product.images && product.images.length > 0) {
      product.images.forEach(img => {
        const formattedUrl = formatImageUrl(img);
        if (formattedUrl && !productImages.includes(formattedUrl)) {
          productImages.push(formattedUrl);
        }
      });
    }
    
    // If no product images, use default fallback images
    if (productImages.length === 0) {
      return getDefaultImages();
    }
    
    return productImages;
  };

  const getProductTypeBadge = () => {
    if (productType === 'door') {
      return <span className="product-type-label door"><FaDoorOpen /> Wood Door</span>;
    }
    if (productType === 'window') {
      return <span className="product-type-label window"><FaWindowMaximize /> Wood Window</span>;
    }
    return null;
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!product) return <div className="error">Product not found</div>;

  // Use product images (handles both 'image' and 'images' fields)
  const images = getProductImages();

  return (
    <div className="product-detail">
      <div className="product-detail-container">
        {/* Image Gallery */}
        <div className="product-gallery">
          <div className="main-image">
            <img src={images[selectedImage]} alt={product.name} />
          </div>
          {images.length > 1 && (
            <div className="thumbnail-images">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${product.name} ${index + 1}`}
                  className={selectedImage === index ? 'active' : ''}
                  onClick={() => setSelectedImage(index)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="product-info">
          {getProductTypeBadge()}
          <h1>{product.name}</h1>
          <p className="category">
            {productType === 'furniture' 
              ? `Category: ${product.category?.name || 'N/A'}` 
              : `Wood Type: ${product.woodType?.name || product.wood?.name || 'Premium Wood'}`
            }
          </p>
          <p className="price">₹{product.price?.toLocaleString()}</p>
          
          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          <div className="product-details">
            <h3>Specifications</h3>
            <ul>
              {(product.wood || product.woodType) && (
                <li className="wood-info">
                  <strong>🪵 Wood Type:</strong> {product.wood?.name || product.woodType?.name}
                  {(product.wood?.durability || product.woodType?.durability) && (
                    <span className="wood-durability"> ({product.wood?.durability || product.woodType?.durability} durability)</span>
                  )}
                </li>
              )}
              {product.material && <li><strong>Material:</strong> {product.material}</li>}
              {product.color && <li><strong>Color:</strong> {product.color}</li>}
              {product.size && <li><strong>Size:</strong> {product.size}</li>}
              {product.dimensions && (
                <li>
                  <strong>Dimensions:</strong> 
                  {product.dimensions.length && product.dimensions.width && product.dimensions.height 
                    ? ` ${product.dimensions.length} x ${product.dimensions.width} x ${product.dimensions.height} cm`
                    : ' Custom sizes available'
                  }
                </li>
              )}
              {product.stock !== undefined && <li><strong>Stock:</strong> {product.stock} available</li>}
            </ul>
          </div>

          {(product.wood || product.woodType) && (
            <div className="wood-details">
              <h3>🪵 Wood Details</h3>
              <div className="wood-card">
                {/* Only show wood image for furniture, not for doors/windows */}
                {productType === 'furniture' && (product.wood?.image || product.woodType?.image) && (
                  <img src={product.wood?.image || product.woodType?.image} alt={product.wood?.name || product.woodType?.name} className="wood-image" />
                )}
                <div className="wood-info-content">
                  <h4>{product.wood?.name || product.woodType?.name}</h4>
                  {(product.wood?.description || product.woodType?.description) && (
                    <p>{product.wood?.description || product.woodType?.description}</p>
                  )}
                  <ul>
                    {(product.wood?.origin || product.woodType?.origin) && (
                      <li><strong>Origin:</strong> {product.wood?.origin || product.woodType?.origin}</li>
                    )}
                    {(product.wood?.grain || product.woodType?.grain) && (
                      <li><strong>Grain:</strong> {product.wood?.grain || product.woodType?.grain}</li>
                    )}
                    {(product.wood?.color || product.woodType?.color) && (
                      <li><strong>Color:</strong> {product.wood?.color || product.woodType?.color}</li>
                    )}
                    {(product.wood?.durability || product.woodType?.durability) && (
                      <li><strong>Durability:</strong> {product.wood?.durability || product.woodType?.durability}</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {product.features?.length > 0 && (
            <div className="product-features">
              <h3>Features</h3>
              <ul>
                {product.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Quantity Selector */}
          {(product.isAvailable !== false) && (product.stock === undefined || product.stock > 0) && (
            <div className="quantity-selector">
              <label>Quantity:</label>
              <div className="quantity-controls">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span>{quantity}</span>
                <button 
                  onClick={() => setQuantity(product.stock ? Math.min(product.stock, quantity + 1) : quantity + 1)}
                  disabled={product.stock && quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div className="product-actions">
            {(product.isAvailable !== false) && (product.stock === undefined || product.stock > 0) ? (
              <>
                <button 
                  onClick={handleAddToCart} 
                  className={`btn-add-cart ${addedToCart ? 'added' : ''} ${productType === 'door' ? 'door-btn' : productType === 'window' ? 'window-btn' : ''}`}
                >
                  {addedToCart ? (
                    <><FaCheck /> Added to Cart</>
                  ) : (
                    <><FaShoppingCart /> Add to Cart</>
                  )}
                </button>
                <button onClick={handleBuyNow} className="btn-buy-now">
                  Buy Now
                </button>
                <button onClick={handleBookNow} className={`btn-book-now ${productType === 'door' ? 'door-btn' : productType === 'window' ? 'window-btn' : ''}`}>
                  Book Now
                </button>
              </>
            ) : (
              <button className="btn-disabled" disabled>
                Out of Stock
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
