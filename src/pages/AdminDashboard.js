import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import ManageFurniture from './admin/ManageFurniture';
import ManageCategories from './admin/ManageCategories';
import ManageWoods from './admin/ManageWoods';
import ManageDoors from './admin/ManageDoors';
import ManageWindows from './admin/ManageWindows';
import ManageLockers from './admin/ManageLockers';
import ManageBookings from './admin/ManageBookings';
import ManageUsers from './admin/ManageUsers';
import Analytics from './admin/Analytics';
import ManageOrders from './admin/ManageOrders';
import ManageCNCDesigns from './admin/ManageCNCDesigns';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const location = useLocation();

  return (
    <div className="admin-dashboard">
      <div className="admin-banner">
        <div className="banner-overlay">
          <h1>Admin Dashboard</h1>
          <p>Manage Your Furniture Showroom</p>
        </div>
      </div>
      <div className="admin-main-content">
      <div className="admin-sidebar">
        <h2>Admin Panel</h2>
        <nav className="admin-nav">
          <Link 
            to="/admin/analytics" 
            className={location.pathname === '/admin/analytics' ? 'active' : ''}
          >
            📊 Analytics
          </Link>
          <Link 
            to="/admin/orders" 
            className={location.pathname === '/admin/orders' ? 'active' : ''}
          >
            🛒 Orders
          </Link>
          <Link 
            to="/admin/furniture" 
            className={location.pathname === '/admin/furniture' ? 'active' : ''}
          >
            📦 Furniture
          </Link>
          <Link 
            to="/admin/categories" 
            className={location.pathname === '/admin/categories' ? 'active' : ''}
          >
            📁 Categories
          </Link>
          <Link 
            to="/admin/woods" 
            className={location.pathname === '/admin/woods' ? 'active' : ''}
          >
            🪵 Wood Types
          </Link>
          <Link 
            to="/admin/doors" 
            className={location.pathname === '/admin/doors' ? 'active' : ''}
          >
            🚪 Doors
          </Link>
          <Link 
            to="/admin/windows" 
            className={location.pathname === '/admin/windows' ? 'active' : ''}
          >
            🪟 Windows
          </Link>
          <Link 
            to="/admin/lockers" 
            className={location.pathname === '/admin/lockers' ? 'active' : ''}
          >
            🔐 Lockers
          </Link>
          <Link 
            to="/admin/cnc-designs" 
            className={location.pathname === '/admin/cnc-designs' ? 'active' : ''}
          >
            🎨 CNC Designs
          </Link>
          <Link 
            to="/admin/bookings" 
            className={location.pathname === '/admin/bookings' ? 'active' : ''}
          >
            📋 Bookings
          </Link>
          <Link 
            to="/admin/users" 
            className={location.pathname === '/admin/users' ? 'active' : ''}
          >
            👥 Users
          </Link>
        </nav>
      </div>

        <div className="admin-content">
          <Routes>
            <Route path="/" element={<AdminHome />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/orders" element={<ManageOrders />} />
            <Route path="/furniture" element={<ManageFurniture />} />
            <Route path="/categories" element={<ManageCategories />} />
            <Route path="/woods" element={<ManageWoods />} />
            <Route path="/doors" element={<ManageDoors />} />
            <Route path="/windows" element={<ManageWindows />} />
            <Route path="/lockers" element={<ManageLockers />} />
            <Route path="/cnc-designs" element={<ManageCNCDesigns />} />
            <Route path="/bookings" element={<ManageBookings />} />
            <Route path="/users" element={<ManageUsers />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const AdminHome = () => (
  <div className="admin-home">
    <h1>Welcome to Admin Dashboard</h1>
    <p>Select an option from the sidebar to manage your showroom.</p>
  </div>
);

export default AdminDashboard;
