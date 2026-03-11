import React, { useState, useEffect } from 'react';
import { categoryAPI, uploadAPI } from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';
import './Admin.css';

const API_BASE_URL = 'http://localhost:5000';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: ''
  });

  useEffect(() => {
    fetchCategories();
    fetchUploadedImages();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchUploadedImages = async () => {
    try {
      const response = await uploadAPI.getImages('categories');
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
        const response = await uploadAPI.uploadImage('categories', file);
        if (response.data.success) {
          const fullPath = API_BASE_URL + response.data.data.path;
          setFormData({ ...formData, image: fullPath });
        }
      }
      fetchUploadedImages();
      alert('Image uploaded successfully!');
    } catch (error) {
      alert('Failed to upload image: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleUploadedImageSelect = (imagePath) => {
    const fullPath = API_BASE_URL + imagePath;
    setFormData({ ...formData, image: fullPath });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await categoryAPI.update(editingId, formData);
        alert('Category updated successfully');
      } else {
        await categoryAPI.create(formData);
        alert('Category created successfully');
      }
      resetForm();
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (category) => {
    setEditingId(category._id);
    setFormData({
      name: category.name,
      description: category.description || '',
      image: category.image || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      await categoryAPI.delete(id);
      alert('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.message || 'Delete failed');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', image: '' });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Manage Categories</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : 'Add New Category'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label>Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} />
          </div>

          {/* Image Upload Section */}
          <div className="form-group">
            <label>Category Image</label>
            <div className="image-upload-section" style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
              
              {/* File Upload */}
              <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '2px dashed #3498db' }}>
                <label style={{ fontWeight: 'bold', marginBottom: '10px', display: 'block', color: '#2980b9' }}>
                  📤 Upload New Image:
                </label>
                <input
                  type="file"
                  accept="image/*"
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
                    ⏳ Uploading image...
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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px', marginBottom: '15px' }}>
                    {uploadedImages.map((img, index) => {
                      const fullPath = API_BASE_URL + img.path;
                      return (
                        <div
                          key={index}
                          onClick={() => handleUploadedImageSelect(img.path)}
                          style={{
                            cursor: 'pointer',
                            border: formData.image === fullPath ? '3px solid #8e44ad' : '2px solid #ddd',
                            borderRadius: '10px',
                            padding: '8px',
                            textAlign: 'center',
                            backgroundColor: formData.image === fullPath ? '#f5eef8' : '#fff',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <img
                            src={fullPath}
                            alt={img.filename}
                            style={{ width: '100%', height: '70px', objectFit: 'cover', borderRadius: '6px' }}
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=No+Image'; }}
                          />
                          {formData.image === fullPath && (
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

              {/* Current Selected Image Preview */}
              {formData.image && (
                <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>
                    Selected Image:
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <img
                      src={formData.image.startsWith('http') ? formData.image : API_BASE_URL + formData.image}
                      alt="Selected"
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #3498db' }}
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=Error'; }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: '' })}
                      style={{
                        background: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        padding: '8px 15px',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              {/* Manual URL Input */}
              <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
                  Or enter Image URL manually:
                </label>
                <input type="text" name="image" value={formData.image} onChange={handleChange} style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }} />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-submit">
            {editingId ? 'Update' : 'Create'} Category
          </button>
        </form>
      )}

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(category => (
              <tr key={category._id}>
                <td>
                  <img src={getImageUrl(category.image, 'https://via.placeholder.com/50')} alt={category.name} className="table-img" />
                </td>
                <td>{category.name}</td>
                <td>{category.description}</td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => handleEdit(category)} className="btn-edit">Edit</button>
                    <button onClick={() => handleDelete(category._id)} className="btn-delete">Delete</button>
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

export default ManageCategories;
