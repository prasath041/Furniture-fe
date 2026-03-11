import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>FurnitureHub</h3>
          <p>Your trusted online furniture showroom & booking platform</p>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/products">Products</a></li>
            <li><a href="/login">Login</a></li>
            <li><a href="/register">Register</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Contact</h4>
          <p>Email: Chithodesrivasanthamtrimper@gmail.com</p>
          <p>Phone: 9842833824 </p>
          <p>Address: 99/6-A,Bhavani Byepass Road, Chittode,Tamil Nadu</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2025 FurnitureHub. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
