import React, { useState, useEffect } from 'react';
import { doorAPI, woodAPI, uploadAPI } from '../../services/api';
import { getProductImage } from '../../utils/imageUtils';
import './Admin.css';

const API_BASE_URL = 'http://localhost:5000';

const ManageDoors = () => {
  const [doors, setDoors] = useState([]);
  const [woods, setWoods] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    doorType: 'Interior',
    wood: '',
    price: '',
    finish: '',
    style: 'Panel',
    glassType: 'None',
    hardware: '',
    stock: '',
    related: [],
    features: '',
    dimensions: { height: '', width: '', thickness: '' }
  });

  useEffect(() => {
    fetchData();
    fetchUploadedImages();
  }, []);

  const fetchData = async () => {
    try {
      const [doorsRes, woodsRes] = await Promise.all([
        doorAPI.getAll(),
        woodAPI.getAll()
      ]);
      setDoors(doorsRes.data.data);
      setWoods(woodsRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchUploadedImages = async () => {
    try {
      const response = await uploadAPI.getImages('doors');
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
        const response = await uploadAPI.uploadImage('doors', file);
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
      dimensions: {
        height: Number(formData.dimensions.height) || 0,
        width: Number(formData.dimensions.width) || 0,
        thickness: Number(formData.dimensions.thickness) || 0
      },
      related: formData.related,
      features: formData.features.split(',').map(f => f.trim()).filter(f => f)
    };

    try {
      if (editingId) {
        await doorAPI.update(editingId, submitData);
        alert('Door updated successfully');
      } else {
        await doorAPI.create(submitData);
        alert('Door created successfully');
      }
      resetForm();
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (door) => {
    setEditingId(door._id);
    setFormData({
      name: door.name,
      description: door.description || '',
      image: door.image || '',
      doorType: door.doorType,
      wood: door.wood?._id || door.wood,
      price: door.price,
      finish: door.finish || '',
      style: door.style || 'Panel',
      glassType: door.glassType || 'None',
      hardware: door.hardware || '',
      stock: door.stock,
      related: door.related?.map(r => r._id || r) || [],
      features: door.features?.join(', ') || '',
      dimensions: {
        height: door.dimensions?.height || '',
        width: door.dimensions?.width || '',
        thickness: door.dimensions?.thickness || ''
      }
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this door?')) return;
    
    try {
      await doorAPI.delete(id);
      alert('Door deleted successfully');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Delete failed');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      doorType: 'Interior',
      wood: '',
      price: '',
      finish: '',
      style: 'Panel',
      glassType: 'None',
      hardware: '',
      stock: '',
      related: [],
      features: '',
      dimensions: { height: '', width: '', thickness: '' }
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>🚪 Manage Doors</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : 'Add New Door'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-row">
            <div className="form-group">
              <label>Door Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Door Type *</label>
              <select name="doorType" value={formData.doorType} onChange={handleChange} required>
                <option value="Interior">Interior</option>
                <option value="Exterior">Exterior</option>
                <option value="Sliding">Sliding</option>
                <option value="French">French</option>
                <option value="Barn">Barn</option>
                <option value="Pocket">Pocket</option>
                <option value="Bifold">Bifold</option>
                <option value="Dutch">Dutch</option>
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
              <label>Style</label>
              <select name="style" value={formData.style} onChange={handleChange}>
                <option value="Panel">Panel</option>
                <option value="Flush">Flush</option>
                <option value="Glass">Glass</option>
                <option value="Louver">Louver</option>
                <option value="Carved">Carved</option>
                <option value="Modern">Modern</option>
                <option value="Traditional">Traditional</option>
                <option value="Rustic">Rustic</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} />
          </div>

          {/* Image Upload Section */}
          <div className="form-group">
            <label>Door Image</label>
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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px', marginBottom: '15px' }}>
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
                            style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '6px' }}
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=No+Image'; }}
                          />
                          <p style={{ fontSize: '10px', margin: '5px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {img.filename}
                          </p>
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
                      style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #3498db' }}
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=Error'; }}
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
                <input type="text" name="image" value={formData.image} onChange={handleChange} placeholder="Enter image URL or path" style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ddd' }} />
              </div>
            </div>
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
                <option value="None">None</option>
                <option value="Clear">Clear</option>
                <option value="Frosted">Frosted</option>
                <option value="Tinted">Tinted</option>
                <option value="Decorative">Decorative</option>
                <option value="Tempered">Tempered</option>
              </select>
            </div>
            <div className="form-group">
              <label>Finish</label>
              <input type="text" name="finish" value={formData.finish} onChange={handleChange} placeholder="e.g., Natural, Stained, Painted" />
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
              <label>Thickness (cm)</label>
              <input type="number" name="dim_thickness" value={formData.dimensions.thickness} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Hardware</label>
            <input type="text" name="hardware" value={formData.hardware} onChange={handleChange} placeholder="e.g., Brass handles, Chrome hinges" />
          </div>

          <div className="form-group">
            <label>Related Doors</label>
            <select
              name="related"
              multiple
              value={formData.related}
              onChange={(e) => {
                const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                setFormData({ ...formData, related: selectedOptions });
              }}
              style={{ height: '100px' }}
            >
              {doors.filter(d => d._id !== editingId).map(door => (
                <option key={door._id} value={door._id}>
                  {door.name} - {door.doorType}
                </option>
              ))}
            </select>
            <small>Hold Ctrl/Cmd to select multiple</small>
          </div>

          <div className="form-group">
            <label>Features (comma-separated)</label>
            <input type="text" name="features" value={formData.features} onChange={handleChange} />
          </div>

          <button type="submit" className="btn-submit">
            {editingId ? 'Update' : 'Create'} Door
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
              <th>Style</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Related</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {doors.map(door => (
              <tr key={door._id}>
                <td>
                  <img src={getProductImage(door, 'https://via.placeholder.com/50?text=Door')} alt={door.name} className="table-img" />
                </td>
                <td><strong>{door.name}</strong></td>
                <td>{door.doorType}</td>
                <td>
                  <span className="wood-badge">{door.wood?.name || 'N/A'}</span>
                </td>
                <td>{door.style}</td>
                <td>₹{door.price?.toLocaleString()}</td>
                <td>{door.stock}</td>
                <td>{door.related?.length || 0}</td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => handleEdit(door)} className="btn-edit">Edit</button>
                    <button onClick={() => handleDelete(door._id)} className="btn-delete">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {doors.length === 0 && (
          <div className="no-data">
            <p>No doors found. Add your first door!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageDoors;
