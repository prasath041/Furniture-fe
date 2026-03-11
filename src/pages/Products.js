import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { furnitureAPI, categoryAPI, woodAPI, doorAPI, windowAPI, lockerAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { FaDoorOpen, FaWindowMaximize, FaCouch, FaThLarge, FaLock } from 'react-icons/fa';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [woods, setWoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    wood: searchParams.get('wood') || '',
    search: '',
    minPrice: '',
    maxPrice: '',
    type: searchParams.get('type') || 'all'
  });

  useEffect(() => {
    fetchCategories();
    fetchWoods();
  }, []);

  useEffect(() => {
    // Update type filter when URL changes
    const typeFromUrl = searchParams.get('type');
    if (typeFromUrl && typeFromUrl !== filters.type) {
      setFilters(prev => ({ ...prev, type: typeFromUrl }));
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchWoods = async () => {
    try {
      const response = await woodAPI.getAll();
      setWoods(response.data.data);
    } catch (error) {
      console.error('Error fetching woods:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.wood) params.wood = filters.wood;
      if (filters.search) params.search = filters.search;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;

      let allProducts = [];

      if (filters.type === 'doors') {
        const response = await doorAPI.getAll(params);
        allProducts = response.data.data.map(item => ({ ...item, productType: 'door' }));
      } else if (filters.type === 'windows') {
        const response = await windowAPI.getAll(params);
        allProducts = response.data.data.map(item => ({ ...item, productType: 'window' }));
      } else if (filters.type === 'furniture') {
        if (filters.category) params.category = filters.category;
        const response = await furnitureAPI.getAll(params);
        allProducts = response.data.data.map(item => ({ ...item, productType: 'furniture' }));
      } else if (filters.type === 'lockers') {
        const response = await lockerAPI.getAll(params);
        allProducts = response.data.data.map(item => ({ ...item, productType: 'locker' }));
      } else {
        // Fetch all types
        const [furnitureRes, doorsRes, windowsRes, lockersRes] = await Promise.all([
          furnitureAPI.getAll(filters.category ? { ...params, category: filters.category } : params),
          doorAPI.getAll(params),
          windowAPI.getAll(params),
          lockerAPI.getAll(params)
        ]);
        
        const furniture = furnitureRes.data.data.map(item => ({ ...item, productType: 'furniture' }));
        const doors = doorsRes.data.data.map(item => ({ ...item, productType: 'door' }));
        const windows = windowsRes.data.data.map(item => ({ ...item, productType: 'window' }));
        const lockers = lockersRes.data.data.map(item => ({ ...item, productType: 'locker' }));
        
        allProducts = [...doors, ...windows, ...furniture, ...lockers];
      }

      // Apply search filter client-side if needed
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        allProducts = allProducts.filter(p => 
          p.name?.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower)
        );
      }

      // Apply price filters client-side
      if (filters.minPrice) {
        allProducts = allProducts.filter(p => p.price >= parseFloat(filters.minPrice));
      }
      if (filters.maxPrice) {
        allProducts = allProducts.filter(p => p.price <= parseFloat(filters.maxPrice));
      }

      setProducts(allProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (type) => {
    setFilters(prev => ({ ...prev, type }));
    if (type !== 'all') {
      setSearchParams({ type });
    } else {
      setSearchParams({});
    }
  };

  const clearFilters = () => {
    setFilters({ category: '', wood: '', search: '', minPrice: '', maxPrice: '', type: 'all' });
    setSearchParams({});
  };

  const getPageTitle = () => {
    switch (filters.type) {
      case 'doors': return 'Wood Doors';
      case 'windows': return 'Wood Windows';
      case 'furniture': return 'Furniture';
      case 'lockers': return 'Lockers & Storage';
      default: return 'All Products';
    }
  };

  return (
    <div className="products-page">
      <h1>{getPageTitle()}</h1>

      {/* Product Type Tabs */}
      <div className="product-type-tabs">
        <button 
          className={`type-tab ${filters.type === 'all' ? 'active' : ''}`}
          onClick={() => handleTypeChange('all')}
        >
          <FaThLarge /> All
        </button>
        <button 
          className={`type-tab doors ${filters.type === 'doors' ? 'active' : ''}`}
          onClick={() => handleTypeChange('doors')}
        >
          <FaDoorOpen /> Doors
        </button>
        <button 
          className={`type-tab windows ${filters.type === 'windows' ? 'active' : ''}`}
          onClick={() => handleTypeChange('windows')}
        >
          <FaWindowMaximize /> Windows
        </button>
        <button 
          className={`type-tab furniture ${filters.type === 'furniture' ? 'active' : ''}`}
          onClick={() => handleTypeChange('furniture')}
        >
          <FaCouch /> Furniture
        </button>
        <button 
          className={`type-tab lockers ${filters.type === 'lockers' ? 'active' : ''}`}
          onClick={() => handleTypeChange('lockers')}
        >
          <FaLock /> Lockers
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <input
            type="text"
            name="search"
            placeholder="Search products..."
            value={filters.search}
            onChange={handleFilterChange}
            className="search-input"
          />
        </div>

        {(filters.type === 'furniture' || filters.type === 'all') && (
          <div className="filter-group">
            <select name="category" value={filters.category} onChange={handleFilterChange}>
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="filter-group">
          <select name="wood" value={filters.wood} onChange={handleFilterChange}>
            <option value="">All Wood Types</option>
            {woods.map(wood => (
              <option key={wood._id} value={wood._id}>{wood.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <input
            type="number"
            name="minPrice"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={handleFilterChange}
          />
        </div>

        <div className="filter-group">
          <input
            type="number"
            name="maxPrice"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={handleFilterChange}
          />
        </div>

        <button onClick={clearFilters} className="btn-clear">Clear Filters</button>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="loading">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="no-products">No products found</div>
      ) : (
        <div className="products-grid">
          {products.map((product, index) => (
            <ProductCard key={`${product.productType}-${product._id}`} furniture={product} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
