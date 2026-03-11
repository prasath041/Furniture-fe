import React, { useState, useEffect, useRef } from 'react';
import { cncAPI, woodAPI, uploadAPI } from '../../services/api';
import './Admin.css';

const ManageCNCDesigns = () => {
  const [designs, setDesigns] = useState([]);
  const [woods, setWoods] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('designs');
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingMultiple, setUploadingMultiple] = useState(false);
  const previewImageRef = useRef(null);
  const additionalImagesRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    previewImage: '',
    additionalImages: [],
    category: 'Traditional',
    carvingStyle: 'Deep Relief',
    patternType: 'Full Door',
    complexity: 'Medium',
    estimatedTime: { value: 8, unit: 'hours' },
    compatibleWoods: [],
    recommendedWood: '',
    defaultDimensions: {
      height: 2100,
      width: 900,
      thickness: 35,
      carvingDepth: 10
    },
    customizable: {
      dimensions: true,
      depth: true,
      mirror: true,
      scale: true
    },
    basePrice: '',
    pricePerSqFt: 500,
    complexityMultiplier: 1,
    tags: '',
    isActive: true,
    isFeatured: false
  });

  const categories = ['Traditional', 'Modern', 'Classic', 'Contemporary', 'Ornate', 'Minimalist', 'Geometric', 'Floral', 'Abstract'];
  const carvingStyles = ['Deep Relief', 'Shallow Relief', 'Engraved', 'Pierced', '3D Sculpted', 'Combination'];
  const patternTypes = ['Full Door', 'Center Panel', 'Border Only', 'Corner Accents', 'Top Panel', 'Bottom Panel', 'Custom'];
  const complexities = ['Simple', 'Medium', 'Complex', 'Highly Complex'];
  const orderStatuses = ['Pending', 'Confirmed', 'Design Processing', 'CNC File Ready', 'Material Preparation', 'In Production', 'Quality Check', 'Finishing', 'Ready for Delivery', 'Shipped', 'Delivered', 'Cancelled'];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'stats') {
      fetchStats();
    }
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const [designsRes, woodsRes] = await Promise.all([
        cncAPI.getAllDesigns({ limit: 100 }),
        woodAPI.getAll()
      ]);
      setDesigns(designsRes.data.data);
      setWoods(woodsRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await cncAPI.getAllOrders({ limit: 50 });
      setOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await cncAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
        }
      }));
    } else if (name === 'compatibleWoods') {
      const options = Array.from(e.target.selectedOptions, option => option.value);
      setFormData(prev => ({ ...prev, compatibleWoods: options }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      basePrice: Number(formData.basePrice),
      pricePerSqFt: Number(formData.pricePerSqFt),
      complexityMultiplier: Number(formData.complexityMultiplier),
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      additionalImages: formData.additionalImages.filter(img => img)
    };

    try {
      if (editingId) {
        await cncAPI.updateDesign(editingId, submitData);
        alert('Design updated successfully!');
      } else {
        await cncAPI.createDesign(submitData);
        alert('Design created successfully!');
      }
      resetForm();
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (design) => {
    setEditingId(design._id);
    setFormData({
      name: design.name,
      description: design.description || '',
      previewImage: design.previewImage || '',
      additionalImages: design.additionalImages || [],
      category: design.category,
      carvingStyle: design.carvingStyle,
      patternType: design.patternType,
      complexity: design.complexity,
      estimatedTime: design.estimatedTime || { value: 8, unit: 'hours' },
      compatibleWoods: design.compatibleWoods?.map(w => w._id) || [],
      recommendedWood: design.recommendedWood?._id || '',
      defaultDimensions: design.defaultDimensions || { height: 2100, width: 900, thickness: 35, carvingDepth: 10 },
      customizable: design.customizable || { dimensions: true, depth: true, mirror: true, scale: true },
      basePrice: design.basePrice,
      pricePerSqFt: design.pricePerSqFt || 500,
      complexityMultiplier: design.complexityMultiplier || 1,
      tags: design.tags?.join(', ') || '',
      isActive: design.isActive,
      isFeatured: design.isFeatured
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this design?')) return;
    
    try {
      await cncAPI.deleteDesign(id);
      alert('Design deleted successfully!');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Delete failed');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await cncAPI.toggleStatus(id);
      fetchData();
    } catch (error) {
      alert('Failed to toggle status');
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      await cncAPI.toggleFeatured(id);
      fetchData();
    } catch (error) {
      alert('Failed to toggle featured');
    }
  };

  // Handle preview image upload
  const handlePreviewImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadAPI.uploadImage('cnc', file);
      if (response.data.success) {
        setFormData(prev => ({
          ...prev,
          previewImage: response.data.data.path
        }));
        alert('Preview image uploaded successfully!');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  // Handle additional images upload
  const handleAdditionalImagesUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingMultiple(true);
    try {
      const response = await uploadAPI.uploadMultiple('cnc', files);
      if (response.data.success) {
        const newPaths = response.data.data.map(img => img.path);
        setFormData(prev => ({
          ...prev,
          additionalImages: [...prev.additionalImages, ...newPaths]
        }));
        alert(`${files.length} image(s) uploaded successfully!`);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to upload images');
    } finally {
      setUploadingMultiple(false);
      if (additionalImagesRef.current) {
        additionalImagesRef.current.value = '';
      }
    }
  };

  // Remove additional image
  const handleRemoveAdditionalImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      additionalImages: prev.additionalImages.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await cncAPI.updateOrderStatus(orderId, { status: newStatus, description: `Status updated to ${newStatus}` });
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      previewImage: '',
      additionalImages: [],
      category: 'Traditional',
      carvingStyle: 'Deep Relief',
      patternType: 'Full Door',
      complexity: 'Medium',
      estimatedTime: { value: 8, unit: 'hours' },
      compatibleWoods: [],
      recommendedWood: '',
      defaultDimensions: { height: 2100, width: 900, thickness: 35, carvingDepth: 10 },
      customizable: { dimensions: true, depth: true, mirror: true, scale: true },
      basePrice: '',
      pricePerSqFt: 500,
      complexityMultiplier: 1,
      tags: '',
      isActive: true,
      isFeatured: false
    });
    setShowForm(false);
  };

  if (loading) {
    return <div className="admin-loading">Loading...</div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>CNC Router Designs Management</h1>
        <p>Manage CNC door designs and manufacturing orders</p>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button 
          className={activeTab === 'designs' ? 'active' : ''} 
          onClick={() => setActiveTab('designs')}
        >
          <i className="fas fa-drafting-compass"></i> Designs
        </button>
        <button 
          className={activeTab === 'orders' ? 'active' : ''} 
          onClick={() => setActiveTab('orders')}
        >
          <i className="fas fa-clipboard-list"></i> Orders
        </button>
        <button 
          className={activeTab === 'stats' ? 'active' : ''} 
          onClick={() => setActiveTab('stats')}
        >
          <i className="fas fa-chart-bar"></i> Statistics
        </button>
      </div>

      {/* Designs Tab */}
      {activeTab === 'designs' && (
        <>
          <div className="admin-actions">
            <button className="btn-add" onClick={() => setShowForm(true)}>
              <i className="fas fa-plus"></i> Add New Design
            </button>
          </div>

          {showForm && (
            <div className="admin-form-container">
              <form onSubmit={handleSubmit} className="admin-form cnc-form">
                <h2>{editingId ? 'Edit Design' : 'Add New CNC Design'}</h2>
                
                <div className="form-section">
                  <h3>Basic Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Design Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="e.g., Royal Floral Pattern"
                      />
                    </div>
                    <div className="form-group">
                      <label>Base Price (₹) *</label>
                      <input
                        type="number"
                        name="basePrice"
                        value={formData.basePrice}
                        onChange={handleChange}
                        required
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Describe the design..."
                    />
                  </div>

                  <div className="form-group">
                    <label>Preview Image *</label>
                    <div className="image-upload-section">
                      <input
                        type="file"
                        ref={previewImageRef}
                        accept="image/*"
                        onChange={handlePreviewImageUpload}
                        style={{ display: 'none' }}
                      />
                      <button 
                        type="button" 
                        className="btn-upload"
                        onClick={() => previewImageRef.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? 'Uploading...' : '📤 Upload Preview Image'}
                      </button>
                      {formData.previewImage && (
                        <div className="image-preview-container">
                          <img 
                            src={formData.previewImage.startsWith('http') 
                              ? formData.previewImage 
                              : `http://localhost:5000${formData.previewImage}`}
                            alt="Preview" 
                            className="form-image-preview"
                            onError={(e) => { e.target.src = '/placeholder.png'; }}
                          />
                          <span className="image-path">{formData.previewImage}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Additional Images (Gallery)</label>
                    <div className="image-upload-section">
                      <input
                        type="file"
                        ref={additionalImagesRef}
                        accept="image/*"
                        multiple
                        onChange={handleAdditionalImagesUpload}
                        style={{ display: 'none' }}
                      />
                      <button 
                        type="button" 
                        className="btn-upload"
                        onClick={() => additionalImagesRef.current?.click()}
                        disabled={uploadingMultiple}
                      >
                        {uploadingMultiple ? 'Uploading...' : '📤 Upload Additional Images'}
                      </button>
                      {formData.additionalImages.length > 0 && (
                        <div className="additional-images-grid">
                          {formData.additionalImages.map((img, index) => (
                            <div key={index} className="additional-image-item">
                              <img 
                                src={img.startsWith('http') ? img : `http://localhost:5000${img}`}
                                alt={`Additional ${index + 1}`}
                                onError={(e) => { e.target.src = '/placeholder.png'; }}
                              />
                              <button 
                                type="button"
                                className="btn-remove-image"
                                onClick={() => handleRemoveAdditionalImage(index)}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Design Classification</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Category *</label>
                      <select name="category" value={formData.category} onChange={handleChange}>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Carving Style *</label>
                      <select name="carvingStyle" value={formData.carvingStyle} onChange={handleChange}>
                        {carvingStyles.map(style => (
                          <option key={style} value={style}>{style}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Pattern Type</label>
                      <select name="patternType" value={formData.patternType} onChange={handleChange}>
                        {patternTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Complexity</label>
                      <select name="complexity" value={formData.complexity} onChange={handleChange}>
                        {complexities.map(comp => (
                          <option key={comp} value={comp}>{comp}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Default Dimensions (mm)</h3>
                  <div className="form-row four-col">
                    <div className="form-group">
                      <label>Height</label>
                      <input
                        type="number"
                        name="defaultDimensions.height"
                        value={formData.defaultDimensions.height}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Width</label>
                      <input
                        type="number"
                        name="defaultDimensions.width"
                        value={formData.defaultDimensions.width}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Thickness</label>
                      <input
                        type="number"
                        name="defaultDimensions.thickness"
                        value={formData.defaultDimensions.thickness}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Carving Depth</label>
                      <input
                        type="number"
                        name="defaultDimensions.carvingDepth"
                        value={formData.defaultDimensions.carvingDepth}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Wood Options</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Recommended Wood</label>
                      <select name="recommendedWood" value={formData.recommendedWood} onChange={handleChange}>
                        <option value="">Select Wood</option>
                        {woods.map(wood => (
                          <option key={wood._id} value={wood._id}>{wood.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Compatible Woods (Hold Ctrl to select multiple)</label>
                      <select 
                        name="compatibleWoods" 
                        value={formData.compatibleWoods} 
                        onChange={handleChange}
                        multiple
                        style={{ height: '100px' }}
                      >
                        {woods.map(wood => (
                          <option key={wood._id} value={wood._id}>{wood.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Pricing & Time</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Estimated Time (hours)</label>
                      <input
                        type="number"
                        name="estimatedTime.value"
                        value={formData.estimatedTime.value}
                        onChange={handleChange}
                        min="1"
                      />
                    </div>
                    <div className="form-group">
                      <label>Price per Sq.Ft (₹)</label>
                      <input
                        type="number"
                        name="pricePerSqFt"
                        value={formData.pricePerSqFt}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Complexity Multiplier</label>
                      <input
                        type="number"
                        name="complexityMultiplier"
                        value={formData.complexityMultiplier}
                        onChange={handleChange}
                        step="0.1"
                        min="0.5"
                        max="3"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Customization Options</h3>
                  <div className="checkbox-row">
                    <label>
                      <input
                        type="checkbox"
                        name="customizable.dimensions"
                        checked={formData.customizable.dimensions}
                        onChange={handleChange}
                      />
                      Allow Custom Dimensions
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        name="customizable.depth"
                        checked={formData.customizable.depth}
                        onChange={handleChange}
                      />
                      Allow Custom Depth
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        name="customizable.mirror"
                        checked={formData.customizable.mirror}
                        onChange={handleChange}
                      />
                      Allow Mirror Design
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        name="customizable.scale"
                        checked={formData.customizable.scale}
                        onChange={handleChange}
                      />
                      Allow Scale Adjustment
                    </label>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Additional</h3>
                  <div className="form-group">
                    <label>Tags (comma separated)</label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      placeholder="e.g., floral, premium, vintage"
                    />
                  </div>
                  <div className="checkbox-row">
                    <label>
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                      />
                      Active (visible to customers)
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        name="isFeatured"
                        checked={formData.isFeatured}
                        onChange={handleChange}
                      />
                      Featured Design
                    </label>
                  </div>
                </div>

                <div className="form-buttons">
                  <button type="submit" className="btn-save">
                    {editingId ? 'Update Design' : 'Create Design'}
                  </button>
                  <button type="button" className="btn-cancel" onClick={resetForm}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Designs List */}
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Preview</th>
                  <th>Design</th>
                  <th>Category</th>
                  <th>Style</th>
                  <th>Complexity</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {designs.map(design => (
                  <tr key={design._id}>
                    <td>
                      <img
                        src={design.previewImage?.startsWith('http') 
                          ? design.previewImage 
                          : `http://localhost:5000${design.previewImage}`}
                        alt={design.name}
                        className="table-preview"
                        onError={(e) => { e.target.src = '/placeholder.png'; }}
                      />
                    </td>
                    <td>
                      <strong>{design.name}</strong>
                      <br />
                      <small>{design.designCode}</small>
                    </td>
                    <td>{design.category}</td>
                    <td>{design.carvingStyle}</td>
                    <td>
                      <span className={`complexity-badge ${design.complexity.toLowerCase().replace(' ', '-')}`}>
                        {design.complexity}
                      </span>
                    </td>
                    <td>₹{design.basePrice?.toLocaleString()}</td>
                    <td>
                      <span className={`status-badge ${design.isActive ? 'active' : 'inactive'}`}>
                        {design.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {design.isFeatured && <span className="featured-tag">⭐</span>}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => handleEdit(design)} title="Edit">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button onClick={() => handleToggleStatus(design._id)} title="Toggle Status">
                          <i className={`fas ${design.isActive ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                        <button onClick={() => handleToggleFeatured(design._id)} title="Toggle Featured">
                          <i className={`fas fa-star ${design.isFeatured ? 'text-warning' : ''}`}></i>
                        </button>
                        <button onClick={() => handleDelete(design._id)} className="delete" title="Delete">
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="admin-table-container">
          <h2>Manufacturing Orders</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Design</th>
                <th>Specifications</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td>
                    <strong>{order.orderNumber}</strong>
                    <br />
                    <small>{new Date(order.createdAt).toLocaleDateString()}</small>
                  </td>
                  <td>
                    {order.customer?.name}
                    <br />
                    <small>{order.customer?.email}</small>
                  </td>
                  <td>
                    {order.design?.name}
                    <br />
                    <small>{order.design?.designCode}</small>
                  </td>
                  <td>
                    <small>
                      {order.specifications?.dimensions?.height} × {order.specifications?.dimensions?.width} mm
                      <br />
                      Wood: {order.specifications?.wood?.name}
                      <br />
                      Qty: {order.specifications?.quantity}
                    </small>
                  </td>
                  <td>₹{order.pricing?.totalAmount?.toLocaleString()}</td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                      className="status-select"
                    >
                      {orderStatuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button className="btn-view" title="View Details">
                      <i className="fas fa-eye"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'stats' && stats && (
        <div className="stats-container">
          <div className="stats-grid">
            <div className="stat-card">
              <i className="fas fa-clipboard-list"></i>
              <div className="stat-info">
                <span className="stat-value">{stats.summary?.totalOrders || 0}</span>
                <span className="stat-label">Total Orders</span>
              </div>
            </div>
            <div className="stat-card">
              <i className="fas fa-clock"></i>
              <div className="stat-info">
                <span className="stat-value">{stats.summary?.pendingOrders || 0}</span>
                <span className="stat-label">Pending Orders</span>
              </div>
            </div>
            <div className="stat-card">
              <i className="fas fa-cogs"></i>
              <div className="stat-info">
                <span className="stat-value">{stats.summary?.inProduction || 0}</span>
                <span className="stat-label">In Production</span>
              </div>
            </div>
            <div className="stat-card">
              <i className="fas fa-check-circle"></i>
              <div className="stat-info">
                <span className="stat-value">{stats.summary?.completed || 0}</span>
                <span className="stat-label">Completed</span>
              </div>
            </div>
          </div>

          <div className="stats-section">
            <h3>Revenue</h3>
            <div className="revenue-stats">
              <div className="revenue-item">
                <label>Total Revenue</label>
                <span>₹{(stats.revenue?.totalRevenue || 0).toLocaleString()}</span>
              </div>
              <div className="revenue-item">
                <label>Average Order Value</label>
                <span>₹{Math.round(stats.revenue?.averageOrderValue || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {stats.popularDesigns?.length > 0 && (
            <div className="stats-section">
              <h3>Popular Designs</h3>
              <div className="popular-designs">
                {stats.popularDesigns.map((design, idx) => (
                  <div key={idx} className="popular-item">
                    <img src={design.previewImage?.startsWith('http') ? design.previewImage : `http://localhost:5000${design.previewImage}`} alt="" />
                    <div className="popular-info">
                      <strong>{design.name}</strong>
                      <span>{design.orderCount} orders</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageCNCDesigns;
