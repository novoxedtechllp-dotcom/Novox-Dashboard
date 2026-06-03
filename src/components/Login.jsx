import React, { useState } from 'react';
import './Login.css';

export default function Login({ onLogin }) {
  const [role, setRole] = useState('Admin');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onLogin) onLogin();
  };

  return (
    <div className="login-wrapper">
      <div className="login-layout">
        {/* Left Panel */}
        <div className="login-left-panel">
          <div className="left-content">
            <div className="logo-section">
              <div className="logo-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3 L2 8 L12 13 L22 8 Z" />
                  <path d="M4.5 10.75 L12 14.5 L19.5 10.75 V 15.5 L12 19.25 L4.5 15.5 Z" />
                  <path d="M20.5 8.75 V 17 H 22 V 8 Z" />
                </svg>
              </div>
              <h2 className="logo-text">Novox Edtech</h2>
            </div>

            <div className="hero-text">
              <h1>Manage Everything with Novox Edtech</h1>
              <p>
                Your all-in-one hub for students, employees, attendance, courses, 
                and more. Streamline your institution's operations with our 
                advanced administrative suite.
              </p>
            </div>

            <div className="features">
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="8" height="10" />
                    <rect x="3" y="16" width="8" height="5" />
                    <rect x="14" y="3" width="7" height="5" />
                    <rect x="14" y="11" width="7" height="10" />
                  </svg>
                </div>
                <span>Real-time Analytics</span>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2.5L5 5v6c0 4.5 3.5 8 7 9.5 3.5-1.5 7-5 7-9.5V5l-7-2.5z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 5l-5 1.8v5.2h5V5z" fill="currentColor"/>
                    <path d="M12 12h5c0 3.5-2.5 6.5-5 7.8V12z" fill="currentColor"/>
                  </svg>
                </div>
                <span>Secure Protocols</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="login-right-panel">
          <div className="login-box">
            <div className="login-header">
              <h2>Welcome Back</h2>
              <p>Enter your credentials to access the management portal.</p>
            </div>

            <div className="role-toggle">
              <button 
                type="button"
                className={`toggle-btn ${role === 'Admin' ? 'active' : ''}`}
                onClick={() => setRole('Admin')}
              >
                Admin
              </button>
              <button 
                type="button"
                className={`toggle-btn ${role === 'Employee' ? 'active' : ''}`}
                onClick={() => setRole('Employee')}
              >
                Employee
              </button>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email or Username</label>
                <div className="input-wrapper">
                  <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <input type="text" placeholder="name@novox-edtech.com" />
                </div>
              </div>

              <div className="form-group">
                <div className="label-row">
                  <label>Password</label>
                  <a href="#" className="forgot-link">Forgot?</a>
                </div>
                <div className="input-wrapper">
                  <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    defaultValue="password123"
                  />
                  <button 
                    type="button" 
                    className="show-pwd-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  Keep me signed in for 30 days
                </label>
              </div>

              <button type="submit" className="submit-btn">
                Sign In
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft: '8px'}}>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </form>

            <div className="footer">
              <span className="copyright">© 2024 Novox Edtech. All rights reserved.</span>
              <div className="footer-links">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
