import React, { useState, useEffect } from 'react';
import { furnitureAPI, categoryAPI, woodAPI, uploadAPI } from '../../services/api';
import { getProductImage } from '../../utils/imageUtils';
import './Admin.css';

const API_BASE_URL = 'http://localhost:5000';

const ManageFurniture = () => {
  const [furniture, setFurniture] = useState([]);
  const [categories, setCategories] = useState([]);
  const [woods, setWoods] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    wood: '',
    price: '',
    material: '',
    color: '',
    stock: '',
    images: '',
    features: ''
  });

  useEffect(() => {
    fetchData();
    fetchUploadedImages();
  }, []);

  const fetchData = async () => {
    try {
      const [furnitureRes, categoriesRes, woodsRes] = await Promise.all([
        furnitureAPI.getAll(),
        categoryAPI.getAll(),
        woodAPI.getAll()
      ]);
      setFurniture(furnitureRes.data.data);
      setCategories(categoriesRes.data.data);
      setWoods(woodsRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchUploadedImages = async () => {
    try {
      const response = await uploadAPI.getImages('furniture');
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
        const response = await uploadAPI.uploadImage('furniture', file);
        if (response.data.success) {
          const fullPath = API_BASE_URL + response.data.data.path;
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
      e.target.value = '';
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      wood: formData.wood || null,
      price: Number(formData.price),
      stock: Number(formData.stock),
      images: formData.images.split(',').map(img => img.trim()).filter(img => img),
      features: formData.features.split(',').map(f => f.trim()).filter(f => f)
    };

    try {
      if (editingId) {
        await furnitureAPI.update(editingId, submitData);
        alert('Furniture updated successfully');
      } else {
        await furnitureAPI.create(submitData);
        alert('Furniture created successfully');
      }
      resetForm();
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      name: item.name,
      description: item.description,
      category: item.category._id || item.category,
      wood: item.wood?._id || item.wood || '',
      price: item.price,
      material: item.material || '',
      color: item.color || '',
      stock: item.stock,
      images: item.images?.join(', ') || '',
      features: item.features?.join(', ') || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this furniture?')) return;
    
    try {
      await furnitureAPI.delete(id);
      alert('Furniture deleted successfully');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Delete failed');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      wood: '',
      price: '',
      material: '',
      color: '',
      stock: '',
      images: '',
      features: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Manage Furniture</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : 'Add New Furniture'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select name="category" value={formData.category} onChange={handleChange} required>
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Wood Type</label>
              <select name="wood" value={formData.wood} onChange={handleChange}>
                <option value="">Select Wood Type (Optional)</option>
                {woods.map(wood => (
                  <option key={wood._id} value={wood._id}>
                    {wood.name} {wood.priceMultiplier !== 1 ? `(×${wood.priceMultiplier})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Material</label>
              <input type="text" name="material" value={formData.material} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Stock</label>
              <input type="number" name="stock" value={formData.stock} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Color</label>
              <input type="text" name="color" value={formData.color} onChange={handleChange} />
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="form-group">
            <label>Furniture Images</label>
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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px', marginBottom: '15px' }}>
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
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <img
                            src={fullPath}
                            alt={img.filename}
                            style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '6px' }}
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=No+Image'; }}
                          />
                          <p style={{ fontSize: '10px', margin: '5px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {img.filename}
                          </p>
                          {formData.images?.includes(fullPath) && (
                            <span style={{ display: 'inline-block', marginTop: '5px', background: '#8e44ad', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '10px' }}>
                              ✓ Selected
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Selected Images Display */}
              {formData.images && (
                <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>
                    Selected Images ({formData.images.split(',').filter(img => img.trim()).length}):
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {formData.images.split(',').filter(img => img.trim()).map((img, index) => (
                      <div key={index} style={{ position: 'relative', width: '80px' }}>
                        <img
                          src={img.trim()}
                          alt={`Selected ${index + 1}`}
                          style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #3498db' }}
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=Error'; }}
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
                            width: '22px',
                            height: '22px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Manual URL Input */}
              <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
                  Or enter Image URLs manually (comma-separated):
                </label>
                <input type="text" name="images" value={formData.images} onChange={handleChange} style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }} />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Features (comma-separated)</label>
            <input type="text" name="features" value={formData.features} onChange={handleChange} />
          </div>

          <button type="submit" className="btn-submit">
            {editingId ? 'Update' : 'Create'} Furniture
          </button>
        </form>
      )}

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Wood</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {furniture.map(item => (
              <tr key={item._id}>
                <td>
                  <img src={getProductImage(item, 'https://via.placeholder.com/50')} alt={item.name} className="table-img" />
                </td>
                <td>{item.name}</td>
                <td>{item.category?.name}</td>
                <td>{item.wood?.name || '-'}</td>
                <td>₹{item.price?.toLocaleString()}</td>
                <td>{item.stock}</td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => handleEdit(item)} className="btn-edit">Edit</button>
                    <button onClick={() => handleDelete(item._id)} className="btn-delete">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageFurniture;
