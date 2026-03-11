import React, { useState, useEffect } from 'react';
import { lockerAPI, uploadAPI } from '../../services/api';
import { getProductImage } from '../../utils/imageUtils';
import './Admin.css';

const API_BASE_URL = 'http://localhost:5000';

const ManageLockers = () => {
  const [lockers, setLockers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    lockerType: 'Wardrobe',
    material: 'Wood',
    price: '',
    images: '',
    finish: '',
    color: '',
    numberOfCompartments: 1,
    numberOfShelves: 0,
    lockType: 'None',
    stock: '',
    features: '',
    rating: 0,
    dimensions: { height: '', width: '', depth: '' }
  });

  useEffect(() => {
    fetchData();
    fetchUploadedImages();
  }, []);

  const fetchData = async () => {
    try {
      const response = await lockerAPI.getAll();
      setLockers(response.data.data);
    } catch (error) {
      console.error('Error fetching lockers:', error);
    }
  };

  const fetchUploadedImages = async () => {
    try {
      const response = await uploadAPI.getImages('lockers');
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
        const response = await uploadAPI.uploadImage('lockers', file);
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
      numberOfCompartments: Number(formData.numberOfCompartments) || 1,
      numberOfShelves: Number(formData.numberOfShelves) || 0,
      dimensions: {
        height: Number(formData.dimensions.height) || 0,
        width: Number(formData.dimensions.width) || 0,
        depth: Number(formData.dimensions.depth) || 0
      },
      images: formData.images.split(',').map(img => img.trim()).filter(img => img),
      features: formData.features.split(',').map(f => f.trim()).filter(f => f)
    };

    try {
      if (editingId) {
        await lockerAPI.update(editingId, submitData);
        alert('Locker updated successfully');
      } else {
        await lockerAPI.create(submitData);
        alert('Locker created successfully');
      }
      resetForm();
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (locker) => {
    setEditingId(locker._id);
    setFormData({
      name: locker.name,
      description: locker.description || '',
      lockerType: locker.lockerType,
      material: locker.material || 'Wood',
      price: locker.price,
      images: locker.images?.join(', ') || '',
      finish: locker.finish || '',
      color: locker.color || '',
      numberOfCompartments: locker.numberOfCompartments || 1,
      numberOfShelves: locker.numberOfShelves || 0,
      lockType: locker.lockType || 'None',
      stock: locker.stock,
      features: locker.features?.join(', ') || '',
      rating: locker.rating || 0,
      dimensions: {
        height: locker.dimensions?.height || '',
        width: locker.dimensions?.width || '',
        depth: locker.dimensions?.depth || ''
      }
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this locker?')) return;
    
    try {
      await lockerAPI.delete(id);
      alert('Locker deleted successfully');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Delete failed');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      lockerType: 'Wardrobe',
      material: 'Wood',
      price: '',
      images: '',
      finish: '',
      color: '',
      numberOfCompartments: 1,
      numberOfShelves: 0,
      lockType: 'None',
      stock: '',
      features: '',
      rating: 0,
      dimensions: { height: '', width: '', depth: '' }
    });
    setEditingId(null);
    setShowForm(false);
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

  const getLockTypeColor = (lockType) => {
    switch (lockType) {
      case 'Biometric': return '#9b59b6';
      case 'Digital Lock': return '#3498db';
      case 'Key Lock': return '#27ae60';
      case 'Combination Lock': return '#f39c12';
      default: return '#7f8c8d';
    }
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>🔐 Manage Lockers & Cabinets</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : 'Add New Locker'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-row">
            <div className="form-group">
              <label>Locker Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Locker Type *</label>
              <select name="lockerType" value={formData.lockerType} onChange={handleChange} required>
                <option value="Wardrobe">Wardrobe</option>
                <option value="Storage Cabinet">Storage Cabinet</option>
                <option value="Filing Cabinet">Filing Cabinet</option>
                <option value="Gym Locker">Gym Locker</option>
                <option value="School Locker">School Locker</option>
                <option value="Industrial Locker">Industrial Locker</option>
                <option value="Modular">Modular</option>
                <option value="Walk-in Closet">Walk-in Closet</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Material</label>
              <select name="material" value={formData.material} onChange={handleChange}>
                <option value="Wood">Wood</option>
                <option value="Metal">Metal</option>
                <option value="Plywood">Plywood</option>
                <option value="MDF">MDF</option>
                <option value="Particle Board">Particle Board</option>
                <option value="Steel">Steel</option>
                <option value="Aluminum">Aluminum</option>
              </select>
            </div>
            <div className="form-group">
              <label>Lock Type</label>
              <select name="lockType" value={formData.lockType} onChange={handleChange}>
                <option value="None">None</option>
                <option value="Key Lock">Key Lock</option>
                <option value="Combination Lock">Combination Lock</option>
                <option value="Digital Lock">Digital Lock</option>
                <option value="Padlock Compatible">Padlock Compatible</option>
                <option value="Biometric">Biometric</option>
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
              <label>Finish</label>
              <input type="text" name="finish" value={formData.finish} onChange={handleChange} placeholder="e.g., Walnut, Oak, Matte Black" />
            </div>
            <div className="form-group">
              <label>Color</label>
              <input type="text" name="color" value={formData.color} onChange={handleChange} placeholder="e.g., Brown, White, Grey" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Number of Compartments</label>
              <input type="number" name="numberOfCompartments" value={formData.numberOfCompartments} onChange={handleChange} min="1" />
            </div>
            <div className="form-group">
              <label>Number of Shelves</label>
              <input type="number" name="numberOfShelves" value={formData.numberOfShelves} onChange={handleChange} min="0" />
            </div>
            <div className="form-group">
              <label>Rating (0-5)</label>
              <input type="number" name="rating" value={formData.rating} onChange={handleChange} min="0" max="5" step="0.1" />
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
            <div className="form-group">
              <label>Depth (cm)</label>
              <input type="number" name="dim_depth" value={formData.dimensions.depth} onChange={handleChange} />
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="form-group">
            <label>Locker Images</label>
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
                  style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px', width: '100%', cursor: 'pointer' }}
                />
                {uploading && <p style={{ color: '#3498db', marginTop: '10px', fontStyle: 'italic' }}>⏳ Uploading image(s)...</p>}
                <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>Supported formats: JPG, PNG, GIF, WebP (Max 5MB)</p>
              </div>

              {/* Uploaded Images from Server */}
              {uploadedImages.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontWeight: 'bold', marginBottom: '10px', display: 'block', color: '#8e44ad' }}>
                    🖼️ Previously Uploaded Images ({uploadedImages.length}):
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
                    {uploadedImages.map((img, index) => {
                      const fullPath = API_BASE_URL + img.path;
                      return (
                        <div
                          key={index}
                          onClick={() => handleUploadedImageSelect(img.path)}
                          style={{
                            cursor: 'pointer',
                            border: formData.images?.includes(fullPath) ? '3px solid #8e44ad' : '2px solid #ddd',
                            borderRadius: '8px',
                            padding: '5px',
                            textAlign: 'center',
                            backgroundColor: formData.images?.includes(fullPath) ? '#f5eef8' : '#fff'
                          }}
                        >
                          <img
                            src={fullPath}
                            alt={img.filename}
                            style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '6px' }}
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=No+Image'; }}
                          />
                          {formData.images?.includes(fullPath) && (
                            <span style={{ display: 'inline-block', marginTop: '5px', background: '#8e44ad', color: 'white', padding: '2px 6px', borderRadius: '10px', fontSize: '10px' }}>✓ Selected</span>
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
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {formData.images.split(',').map((img, index) => (
                      img.trim() && (
                        <div key={index} style={{ position: 'relative' }}>
                          <img
                            src={img.trim()}
                            alt={`Selected ${index + 1}`}
                            style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #27ae60' }}
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=Error'; }}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            style={{
                              position: 'absolute', top: '-8px', right: '-8px', background: '#e74c3c', color: 'white',
                              border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '12px'
                            }}
                          >×</button>
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
            <input type="text" name="features" value={formData.features} onChange={handleChange} placeholder="e.g., Adjustable Shelves, Mirror, Drawer" />
          </div>

          <button type="submit" className="btn-submit">
            {editingId ? 'Update' : 'Create'} Locker
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
              <th>Material</th>
              <th>Dimensions</th>
              <th>Compartments</th>
              <th>Lock Type</th>
              <th>Rating</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {lockers.map(item => (
              <tr key={item._id}>
                <td>
                  <img src={getProductImage(item, 'https://via.placeholder.com/50?text=Locker')} alt={item.name} className="table-img" />
                </td>
                <td><strong>{item.name}</strong></td>
                <td>{item.lockerType}</td>
                <td>{item.material}</td>
                <td>
                  {item.dimensions?.height && item.dimensions?.width 
                    ? `${item.dimensions.height}×${item.dimensions.width}×${item.dimensions.depth || 0} cm` 
                    : 'N/A'}
                </td>
                <td>{item.numberOfCompartments || 1} / {item.numberOfShelves || 0} shelves</td>
                <td>
                  <span 
                    style={{ 
                      backgroundColor: getLockTypeColor(item.lockType),
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px'
                    }}
                  >
                    {item.lockType || 'None'}
                  </span>
                </td>
                <td>
                  <span style={{ color: '#f39c12' }}>
                    {'★'.repeat(Math.round(item.rating || 0))}{'☆'.repeat(5 - Math.round(item.rating || 0))}
                  </span>
                </td>
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
        {lockers.length === 0 && (
          <div className="no-data">
            <p>No lockers found. Add your first locker!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageLockers;
