import React, { useState, useEffect } from 'react';
import { windowAPI, woodAPI, uploadAPI } from '../../services/api';
import { getProductImage } from '../../utils/imageUtils';
import './Admin.css';

const API_BASE_URL = 'http://localhost:5000';

const ManageWindows = () => {
  const [windows, setWindows] = useState([]);
  const [woods, setWoods] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    windowType: 'Double Hung',
    wood: '',
    price: '',
    image: '',
    finish: '',
    glassType: 'Double Pane',
    frameStyle: 'Traditional',
    grillPattern: 'None',
    operationType: 'Operable',
    energyRating: 'Standard',
    stock: '',
    images: '',
    features: '',
    isAvailable: true,
    rating: 0,
    dimensions: { height: '', width: '' }
  });

  useEffect(() => {
    fetchData();
    fetchUploadedImages();
  }, []);

  const fetchData = async () => {
    try {
      const [windowsRes, woodsRes] = await Promise.all([
        windowAPI.getAll(),
        woodAPI.getAll()
      ]);
      setWindows(windowsRes.data.data);
      setWoods(woodsRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchUploadedImages = async () => {
    try {
      const response = await uploadAPI.getImages('windows');
      setUploadedImages(response.data.data || []);
    } catch (error) {
      console.error('Error fetching uploaded images:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        const response = await uploadAPI.uploadImage('windows', file);
        if (response.data.success) {
          const fullPath = API_BASE_URL + response.data.data.path;
          // Add to selected images
          const currentImages = formData.images ? formData.images.split(',').map(img => img.trim()).filter(img => img) : [];
          if (!currentImages.includes(fullPath)) {
            const newImages = [...currentImages, fullPath].join(', ');
            setFormData({ ...formData, images: newImages });
          }
        }
      }
      fetchUploadedImages();
      alert('Image(s) uploaded successfully!');
    } catch (error) {
      alert('Failed to upload image: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset file input
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('dim_')) {
      const dimField = name.replace('dim_', '');
      setFormData({
        ...formData,
        dimensions: { ...formData.dimensions, [dimField]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
      rating: Number(formData.rating) || 0,
      isAvailable: formData.isAvailable === true || formData.isAvailable === 'true',
      dimensions: {
        height: Number(formData.dimensions.height) || 0,
        width: Number(formData.dimensions.width) || 0
      },
      images: formData.images.split(',').map(img => img.trim()).filter(img => img),
      features: formData.features.split(',').map(f => f.trim()).filter(f => f)
    };

    try {
      if (editingId) {
        await windowAPI.update(editingId, submitData);
        alert('Window updated successfully');
      } else {
        await windowAPI.create(submitData);
        alert('Window created successfully');
      }
      resetForm();
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (window) => {
    setEditingId(window._id);
    setFormData({
      name: window.name,
      description: window.description || '',
      windowType: window.windowType,
      wood: window.wood?._id || window.wood,
      price: window.price,
      image: window.image || '',
      finish: window.finish || '',
      glassType: window.glassType || 'Double Pane',
      frameStyle: window.frameStyle || 'Traditional',
      grillPattern: window.grillPattern || 'None',
      operationType: window.operationType || 'Operable',
      energyRating: window.energyRating || 'Standard',
      stock: window.stock,
      images: window.images?.join(', ') || '',
      features: window.features?.join(', ') || '',
      isAvailable: window.isAvailable !== false,
      rating: window.rating || 0,
      dimensions: {
        height: window.dimensions?.height || '',
        width: window.dimensions?.width || ''
      }
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this window?')) return;
    
    try {
      await windowAPI.delete(id);
      alert('Window deleted successfully');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Delete failed');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      windowType: 'Double Hung',
      wood: '',
      price: '',
      image: '',
      finish: '',
      glassType: 'Double Pane',
      frameStyle: 'Traditional',
      grillPattern: 'None',
      operationType: 'Operable',
      energyRating: 'Standard',
      stock: '',
      images: '',
      features: '',
      isAvailable: true,
      rating: 0,
      dimensions: { height: '', width: '' }
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Predefined window images from assets folder
  const predefinedWindowImages = [
    { name: 'Chettinad Window', path: process.env.PUBLIC_URL + '/assets/windows/chettinad.jpg' },
    { name: 'Colonial Window', path: process.env.PUBLIC_URL + '/assets/windows/colinal.jpg' },
    { name: 'Mango Wood Window', path: process.env.PUBLIC_URL + '/assets/windows/mango.jpg' },
    { name: 'Pooja Room Window', path: process.env.PUBLIC_URL + '/assets/windows/pooja room.jpg' },
    { name: 'Sal Wood Window', path: process.env.PUBLIC_URL + '/assets/windows/sal window.jpg' },
    { name: 'Teak Wood Window', path: process.env.PUBLIC_URL + '/assets/windows/teak wood image.jpg' },
    { name: 'Temple Window', path: process.env.PUBLIC_URL + '/assets/windows/temple window.jpg' }
  ];

  const handlePredefinedImageSelect = (imagePath) => {
    const currentImages = formData.images ? formData.images.split(',').map(img => img.trim()).filter(img => img) : [];
    if (!currentImages.includes(imagePath)) {
      const newImages = [...currentImages, imagePath].join(', ');
      setFormData({ ...formData, images: newImages });
    }
  };

  const handleUploadedImageSelect = (imagePath) => {
    const fullPath = API_BASE_URL + imagePath;
    const currentImages = formData.images ? formData.images.split(',').map(img => img.trim()).filter(img => img) : [];
    if (!currentImages.includes(fullPath)) {
      const newImages = [...currentImages, fullPath].join(', ');
      setFormData({ ...formData, images: newImages });
    }
  };

  const removeImage = (indexToRemove) => {
    const currentImages = formData.images.split(',').map(img => img.trim()).filter(img => img);
    const newImages = currentImages.filter((_, index) => index !== indexToRemove).join(', ');
    setFormData({ ...formData, images: newImages });
  };

  const getEnergyRatingColor = (rating) => {
    switch (rating) {
      case 'High Efficiency': return '#27ae60';
      case 'Energy Star': return '#2ecc71';
      default: return '#7f8c8d';
    }
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>🪟 Manage Windows</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : 'Add New Window'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-row">
            <div className="form-group">
              <label>Window Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Window Type *</label>
              <select name="windowType" value={formData.windowType} onChange={handleChange} required>
                <option value="Single Hung">Single Hung</option>
                <option value="Double Hung">Double Hung</option>
                <option value="Casement">Casement</option>
                <option value="Sliding">Sliding</option>
                <option value="Bay">Bay</option>
                <option value="Bow">Bow</option>
                <option value="Awning">Awning</option>
                <option value="Fixed">Fixed</option>
                <option value="Skylight">Skylight</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Wood Type *</label>
              <select name="wood" value={formData.wood} onChange={handleChange} required>
                <option value="">Select Wood Type</option>
                {woods.map(wood => (
                  <option key={wood._id} value={wood._id}>
                    {wood.name} - {wood.durability} Durability (×{wood.priceMultiplier})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Frame Style</label>
              <select name="frameStyle" value={formData.frameStyle} onChange={handleChange}>
                <option value="Traditional">Traditional</option>
                <option value="Modern">Modern</option>
                <option value="Colonial">Colonial</option>
                <option value="Craftsman">Craftsman</option>
                <option value="Victorian">Victorian</option>
                <option value="Contemporary">Contemporary</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price *</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Stock *</label>
              <input type="number" name="stock" value={formData.stock} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Glass Type</label>
              <select name="glassType" value={formData.glassType} onChange={handleChange}>
                <option value="Single Pane">Single Pane</option>
                <option value="Double Pane">Double Pane</option>
                <option value="Triple Pane">Triple Pane</option>
                <option value="Tempered">Tempered</option>
                <option value="Laminated">Laminated</option>
                <option value="Low-E">Low-E</option>
              </select>
            </div>
            <div className="form-group">
              <label>Grill Pattern</label>
              <select name="grillPattern" value={formData.grillPattern} onChange={handleChange}>
                <option value="None">None</option>
                <option value="Colonial">Colonial</option>
                <option value="Prairie">Prairie</option>
                <option value="Diamond">Diamond</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Operation Type</label>
              <select name="operationType" value={formData.operationType} onChange={handleChange}>
                <option value="Fixed">Fixed</option>
                <option value="Operable">Operable</option>
                <option value="Tilt-In">Tilt-In</option>
                <option value="Pivot">Pivot</option>
              </select>
            </div>
            <div className="form-group">
              <label>Energy Rating</label>
              <select name="energyRating" value={formData.energyRating} onChange={handleChange}>
                <option value="Standard">Standard</option>
                <option value="Energy Star">Energy Star</option>
                <option value="High Efficiency">High Efficiency</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Height (cm)</label>
              <input type="number" name="dim_height" value={formData.dimensions.height} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Width (cm)</label>
              <input type="number" name="dim_width" value={formData.dimensions.width} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Finish</label>
            <input type="text" name="finish" value={formData.finish} onChange={handleChange} placeholder="e.g., Natural, Stained, Painted White" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Rating (0-5)</label>
              <input 
                type="number" 
                name="rating" 
                value={formData.rating} 
                onChange={handleChange} 
                min="0" 
                max="5" 
                step="0.1"
                placeholder="0-5"
              />
            </div>
            <div className="form-group">
              <label>Availability</label>
              <select 
                name="isAvailable" 
                value={formData.isAvailable} 
                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.value === 'true' })}
              >
                <option value="true">✅ Available</option>
                <option value="false">❌ Not Available</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Primary Image URL (optional)</label>
            <input 
              type="text" 
              name="image" 
              value={formData.image} 
              onChange={handleChange} 
              placeholder="Enter image URL or leave empty to use first uploaded image"
            />
          </div>

          {/* Image Upload Section */}
          <div className="form-group">
            <label>Window Images</label>
            <div className="image-upload-section" style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
              
              {/* File Upload */}
              <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '2px dashed #3498db' }}>
                <label style={{ fontWeight: 'bold', marginBottom: '10px', display: 'block', color: '#2980b9' }}>
                  📤 Upload New Images:
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  disabled={uploading}
                  style={{
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    width: '100%',
                    cursor: 'pointer'
                  }}
                />
                {uploading && (
                  <p style={{ color: '#3498db', marginTop: '10px', fontStyle: 'italic' }}>
                    ⏳ Uploading image(s)...
                  </p>
                )}
                <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                  Supported formats: JPG, PNG, GIF, WebP (Max 5MB)
                </p>
              </div>

              {/* Uploaded Images from Server */}
              {uploadedImages.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontWeight: 'bold', marginBottom: '10px', display: 'block', color: '#8e44ad' }}>
                    🖼️ Previously Uploaded Images ({uploadedImages.length}):
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', marginBottom: '15px' }}>
                    {uploadedImages.map((img, index) => {
                      const fullPath = API_BASE_URL + img.path;
                      return (
                        <div
                          key={index}
                          onClick={() => handleUploadedImageSelect(img.path)}
                          style={{
                            cursor: 'pointer',
                            border: formData.images?.includes(fullPath) ? '3px solid #8e44ad' : '2px solid #ddd',
                            borderRadius: '10px',
                            padding: '8px',
                            textAlign: 'center',
                            backgroundColor: formData.images?.includes(fullPath) ? '#f5eef8' : '#fff',
                            transition: 'all 0.2s ease',
                            boxShadow: formData.images?.includes(fullPath) ? '0 4px 12px rgba(142, 68, 173, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        >
                          <img
                            src={fullPath}
                            alt={img.filename}
                            style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '6px' }}
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=No+Image'; }}
                          />
                          <p style={{ fontSize: '10px', margin: '8px 0 0', color: '#333', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {img.filename}
                          </p>
                          {formData.images?.includes(fullPath) && (
                            <span style={{ 
                              display: 'inline-block', 
                              marginTop: '5px', 
                              background: '#8e44ad', 
                              color: 'white', 
                              padding: '2px 8px', 
                              borderRadius: '10px', 
                              fontSize: '10px' 
                            }}>
                              ✓ Selected
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Predefined Images from Assets */}
              <div>
                <label style={{ fontWeight: 'bold', marginBottom: '10px', display: 'block', color: '#27ae60' }}>🪟 Predefined Window Images:</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', marginBottom: '15px' }}>
                  {predefinedWindowImages.map((img, index) => (
                    <div
                      key={index}
                      onClick={() => handlePredefinedImageSelect(img.path)}
                      style={{
                        cursor: 'pointer',
                        border: formData.images?.includes(img.path) ? '3px solid #27ae60' : '2px solid #ddd',
                        borderRadius: '10px',
                        padding: '8px',
                        textAlign: 'center',
                        backgroundColor: formData.images?.includes(img.path) ? '#e8f5e9' : '#fff',
                        transition: 'all 0.2s ease',
                        boxShadow: formData.images?.includes(img.path) ? '0 4px 12px rgba(39, 174, 96, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      <img
                        src={img.path}
                        alt={img.name}
                        style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '6px' }}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=No+Image'; }}
                      />
                      <p style={{ fontSize: '12px', margin: '8px 0 0', color: '#333', fontWeight: '500' }}>{img.name}</p>
                      {formData.images?.includes(img.path) && (
                        <span style={{ 
                          display: 'inline-block', 
                          marginTop: '5px', 
                          background: '#27ae60', 
                          color: 'white', 
                          padding: '2px 8px', 
                          borderRadius: '10px', 
                          fontSize: '10px' 
                        }}>
                          ✓ Selected
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Images Display */}
              {formData.images && (
                <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>
                    Selected Images ({formData.images.split(',').filter(img => img.trim()).length}):
                  </label>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {formData.images.split(',').map((img, index) => (
                      img.trim() && (
                        <div key={index} style={{ position: 'relative' }}>
                          <img
                            src={img.trim()}
                            alt={`Selected ${index + 1}`}
                            style={{ 
                              width: '90px', 
                              height: '90px', 
                              objectFit: 'cover', 
                              borderRadius: '8px', 
                              border: '2px solid #27ae60',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                            }}
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/90?text=Error'; }}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            style={{
                              position: 'absolute',
                              top: '-8px',
                              right: '-8px',
                              background: '#e74c3c',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '24px',
                              height: '24px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Features (comma-separated)</label>
            <input type="text" name="features" value={formData.features} onChange={handleChange} />
          </div>

          <button type="submit" className="btn-submit">
            {editingId ? 'Update' : 'Create'} Window
          </button>
        </form>
      )}

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Type</th>
              <th>Wood</th>
              <th>Glass</th>
              <th>Dimensions</th>
              <th>Energy</th>
              <th>Rating</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {windows.map(win => (
              <tr key={win._id}>
                <td>
                  <img src={getProductImage(win, 'https://via.placeholder.com/50?text=Window')} alt={win.name} className="table-img" />
                </td>
                <td><strong>{win.name}</strong></td>
                <td>{win.windowType}</td>
                <td>
                  <span className="wood-badge">{win.wood?.name || 'N/A'}</span>
                </td>
                <td>{win.glassType}</td>
                <td>
                  {win.dimensions?.height && win.dimensions?.width 
                    ? `${win.dimensions.height}×${win.dimensions.width} cm` 
                    : 'N/A'}
                </td>
                <td>
                  <span 
                    style={{ 
                      backgroundColor: getEnergyRatingColor(win.energyRating),
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px'
                    }}
                  >
                    {win.energyRating}
                  </span>
                </td>
                <td>
                  <span style={{ color: '#f39c12' }}>
                    {'★'.repeat(Math.round(win.rating || 0))}{'☆'.repeat(5 - Math.round(win.rating || 0))}
                  </span>
                  <span style={{ fontSize: '10px', marginLeft: '4px' }}>({win.rating || 0})</span>
                </td>
                <td>₹{win.price?.toLocaleString()}</td>
                <td>{win.stock}</td>
                <td>
                  <span 
                    style={{ 
                      backgroundColor: win.isAvailable !== false ? '#27ae60' : '#e74c3c',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px'
                    }}
                  >
                    {win.isAvailable !== false ? '✅ Available' : '❌ Unavailable'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => handleEdit(win)} className="btn-edit">Edit</button>
                    <button onClick={() => handleDelete(win._id)} className="btn-delete">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {windows.length === 0 && (
          <div className="no-data">
            <p>No windows found. Add your first window!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageWindows;
