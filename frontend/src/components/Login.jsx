import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [role, setRole] = useState('Admin');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (isForgotPassword) {
      if (!otpSent) {
        setOtpSent(true);
        // Simulate sending OTP
      } else {
        if (password !== confirmPassword) {
          setError("Passwords do not match!");
          return;
        }
        // Simulate resetting password
        setIsForgotPassword(false);
        setOtpSent(false);
        setPassword('');
        setConfirmPassword('');
        setOtp('');
      }
      return;
    }

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        const userInfoToSave = { ...data.data.user, token: data.data.accessToken };
        
        // Enforce login panel restriction
        if (role === 'Admin' && userInfoToSave.role !== 'ADMIN') {
          setError('Invalid login panel. You do not have Admin privileges.');
          return;
        }
        if (role === 'Employee' && userInfoToSave.role !== 'EMPLOYEE') {
          setError('Invalid login panel. Please use the Employee panel.');
          return;
        }
        if (role === 'Student' && userInfoToSave.role !== 'STUDENT') {
          setError('Invalid login panel. Please use the Student panel.');
          return;
        }

        sessionStorage.setItem('userInfo', JSON.stringify(userInfoToSave));
        if (onLogin) onLogin(userInfoToSave.role);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error("Backend connection failed:", err);
      setError("Failed to connect to the server. Please ensure the backend is running.");
    }
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
              <h2>{isForgotPassword ? 'Reset Password' : 'Welcome Back'}</h2>
              <p>{isForgotPassword ? (otpSent ? 'Enter the OTP sent to your email and your new password.' : 'Enter your email to receive a password reset OTP.') : 'Enter your credentials to access the management portal.'}</p>
            </div>

            {!isForgotPassword && (
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
                <button 
                  type="button"
                  className={`toggle-btn ${role === 'Student' ? 'active' : ''}`}
                  onClick={() => setRole('Student')}
                >
                  Student
                </button>
              </div>
            )}

            <form className="login-form" onSubmit={handleSubmit}>
              {isForgotPassword ? (
                <>
                  <div className="form-group">
                    <label>Email Address</label>
                    <div className="input-wrapper">
                      <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                      <input type="email" placeholder="name@novox-edtech.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={otpSent} />
                    </div>
                  </div>

                  {otpSent && (
                    <>
                      <div className="form-group">
                        <label>OTP Code</label>
                        <div className="input-wrapper">
                          <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                          </svg>
                          <input type="text" placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>New Password</label>
                        <div className="input-wrapper">
                          <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="••••••••" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
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
                      <div className="form-group">
                        <label>Confirm Password</label>
                        <div className="input-wrapper">
                          <input 
                            type={showConfirmPassword ? "text" : "password"} 
                            placeholder="••••••••" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            required 
                          />
                          <button 
                            type="button" 
                            className="show-pwd-btn"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {error && <div style={{color: 'red', fontSize: '14px', marginBottom: '15px'}}>{error}</div>}

                  <button type="submit" className="submit-btn" style={{marginTop: '10px'}}>
                    {otpSent ? 'Reset Password' : 'Send OTP'}
                  </button>

                  <div style={{textAlign: 'center', marginTop: '20px', fontSize: '14px'}}>
                    <a href="#" onClick={(e) => { e.preventDefault(); setIsForgotPassword(false); setOtpSent(false); }} style={{color: '#555F6B', textDecoration: 'none'}}>Back to Login</a>
                  </div>
                </>
              ) : (
                <>
              <div className="form-group">
                <label>Email or Username</label>
                <div className="input-wrapper">
                  <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <input type="email" placeholder="name@novox-edtech.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <div className="label-row">
                  <label>Password</label>
                </div>
                <div className="input-wrapper">
                  <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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
                {(role === 'Employee' || role === 'Student') && (
                  <div style={{textAlign: 'right', marginTop: '8px'}}>
                    <a href="#" onClick={(e) => { e.preventDefault(); setIsForgotPassword(true); }} className="forgot-link" style={{color: '#003F87', textDecoration: 'none', fontSize: '13px', fontWeight: '500'}}>Forgot Password?</a>
                  </div>
                )}
              </div>

              {error && <div style={{color: 'red', fontSize: '14px', marginBottom: '15px'}}>{error}</div>}

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

              {role !== 'Admin' && (
                <div style={{textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#555F6B'}}>
                  Don't have an account? 
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate('/signup'); }} style={{color: '#003F87', fontWeight: 'bold', textDecoration: 'none', marginLeft: '5px'}}>
                    Sign Up
                  </a>
                </div>
              )}
              </>
            )}
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

