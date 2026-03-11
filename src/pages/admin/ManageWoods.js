import React, { useState, useEffect } from 'react';
import { woodAPI } from '../../services/api';
import './Admin.css';

const ManageWoods = () => {
  const [woods, setWoods] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    origin: '',
    durability: 'Medium',
    grain: '',
    color: '',
    priceMultiplier: 1.0
  });

  useEffect(() => {
    fetchWoods();
  }, []);

  const fetchWoods = async () => {
    try {
      const response = await woodAPI.getAll();
      setWoods(response.data.data);
    } catch (error) {
      console.error('Error fetching woods:', error);
    }
  };

  const handleChange = (e) => {
    const value = e.target.name === 'priceMultiplier' 
      ? parseFloat(e.target.value) || 1.0
      : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await woodAPI.update(editingId, formData);
        alert('Wood type updated successfully');
      } else {
        await woodAPI.create(formData);
        alert('Wood type created successfully');
      }
      resetForm();
      fetchWoods();
    } catch (error) {
      alert(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (wood) => {
    setEditingId(wood._id);
    setFormData({
      name: wood.name,
      description: wood.description || '',
      image: wood.image || '',
      origin: wood.origin || '',
      durability: wood.durability || 'Medium',
      grain: wood.grain || '',
      color: wood.color || '',
      priceMultiplier: wood.priceMultiplier || 1.0
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this wood type?')) return;
    
    try {
      await woodAPI.delete(id);
      alert('Wood type deleted successfully');
      fetchWoods();
    } catch (error) {
      alert(error.response?.data?.message || 'Delete failed');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      origin: '',
      durability: 'Medium',
      grain: '',
      color: '',
      priceMultiplier: 1.0
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getDurabilityColor = (durability) => {
    switch (durability) {
      case 'Very High': return '#27ae60';
      case 'High': return '#2ecc71';
      case 'Medium': return '#f39c12';
      case 'Low': return '#e74c3c';
      default: return '#7f8c8d';
    }
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>🪵 Manage Wood Types</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : 'Add New Wood Type'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-row">
            <div className="form-group">
              <label>Wood Name *</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="e.g., Oak, Teak, Walnut"
                required 
              />
            </div>
            <div className="form-group">
              <label>Origin</label>
              <input 
                type="text" 
                name="origin" 
                value={formData.origin} 
                onChange={handleChange}
                placeholder="e.g., North America, Southeast Asia"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange}
              placeholder="Describe the wood characteristics..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Durability</label>
              <select name="durability" value={formData.durability} onChange={handleChange}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Very High">Very High</option>
              </select>
            </div>
            <div className="form-group">
              <label>Price Multiplier</label>
              <input 
                type="number" 
                name="priceMultiplier" 
                value={formData.priceMultiplier} 
                onChange={handleChange}
                step="0.1"
                min="0.1"
                placeholder="1.0"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Grain Pattern</label>
              <input 
                type="text" 
                name="grain" 
                value={formData.grain} 
                onChange={handleChange}
                placeholder="e.g., Straight, Wavy, Interlocked"
              />
            </div>
            <div className="form-group">
              <label>Natural Color</label>
              <input 
                type="text" 
                name="color" 
                value={formData.color} 
                onChange={handleChange}
                placeholder="e.g., Light Brown, Golden, Dark Brown"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Image URL</label>
            <input 
              type="text" 
              name="image" 
              value={formData.image} 
              onChange={handleChange}
              placeholder="https://example.com/wood-image.jpg"
            />
          </div>

          <button type="submit" className="btn-submit">
            {editingId ? 'Update' : 'Create'} Wood Type
          </button>
        </form>
      )}

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Origin</th>
              <th>Durability</th>
              <th>Grain</th>
              <th>Color</th>
              <th>Price Multiplier</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {woods.map(wood => (
              <tr key={wood._id}>
                <td>
                  <img 
                    src={wood.image || 'https://via.placeholder.com/50?text=Wood'} 
                    alt={wood.name} 
                    className="table-img" 
                  />
                </td>
                <td><strong>{wood.name}</strong></td>
                <td>{wood.origin || '-'}</td>
                <td>
                  <span 
                    className="durability-badge"
                    style={{ 
                      backgroundColor: getDurabilityColor(wood.durability),
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  >
                    {wood.durability}
                  </span>
                </td>
                <td>{wood.grain || '-'}</td>
                <td>{wood.color || '-'}</td>
                <td>×{wood.priceMultiplier?.toFixed(1) || '1.0'}</td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => handleEdit(wood)} className="btn-edit">Edit</button>
                    <button onClick={() => handleDelete(wood._id)} className="btn-delete">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {woods.length === 0 && (
          <div className="no-data">
            <p>No wood types found. Add your first wood type!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageWoods;
