import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/Login.css"; // Reusing the same theme

export default function Signup() {
  const [role, setRole] = useState('STUDENT');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [parentCountryCode, setParentCountryCode] = useState('+91');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Role-specific fields
  const [designation, setDesignation] = useState('');
  const [employeeRole, setEmployeeRole] = useState('HR'); // HR, SALES, MARKETING, DEVELOPMENT, DESIGN
  const [parentPhone, setParentPhone] = useState('');
  const [address, setAddress] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const payload = {
        email,
        password,
        role
      };

      if (role === 'EMPLOYEE' || role === 'STUDENT') {
        payload.first_name = firstName;
        payload.last_name = lastName;
        payload.phone = `${countryCode}${phone}`;
        payload.joining_date = new Date().toISOString().split('T')[0];
        
        if (role === 'EMPLOYEE') {
          payload.designation = designation || 'Staff';
          payload.employee_role = employeeRole;
        } else if (role === 'STUDENT') {
          payload.parent_phone = parentPhone ? `${parentCountryCode}${parentPhone}` : '';
          payload.address = address;
        }
      }

      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.message || 'Registration failed');
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
            <div className="logo-section bg-white p-4 rounded-2xl inline-flex shadow-lg" style={{ marginBottom: '2rem' }}>
              <img src="/novox-edtech-calicut-logo.png" alt="Novox Edtech" className="h-[40px] object-contain" />
            </div>

            <div className="hero-text">
              <h1>Join Our Learning Community</h1>
              <p>
                Create an account to access courses, track attendance, and manage your academic or professional journey with Novox Edtech.
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="login-right-panel" style={{ overflowY: 'auto' }}>
          <div className="login-box">
            <div className="login-header">
              <h2>Create an Account</h2>
              <p>Select your role and fill in your details to get started.</p>
            </div>

            <div className="role-toggle" style={{ marginBottom: '20px' }}>
              <button 
                type="button"
                className={`toggle-btn ${role === 'EMPLOYEE' ? 'active' : ''}`}
                onClick={() => setRole('EMPLOYEE')}
              >
                Employee
              </button>
              <button 
                type="button"
                className={`toggle-btn ${role === 'STUDENT' ? 'active' : ''}`}
                onClick={() => setRole('STUDENT')}
              >
                Student
              </button>
            </div>

            {success ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ width: '60px', height: '60px', background: '#e6f4ea', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#137333' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <h3 style={{ color: '#137333', marginBottom: '10px' }}>Registration Successful!</h3>
                <p style={{ color: '#555F6B', fontSize: '14px' }}>Redirecting to login page...</p>
              </div>
            ) : (
              <form className="login-form" onSubmit={handleSubmit}>
                {(role === 'STUDENT' || role === 'EMPLOYEE') && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div className="form-group">
                        <label>First Name</label>
                        <div className="input-wrapper">
                          <input type="text" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Last Name</label>
                        <div className="input-wrapper">
                          <input type="text" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Phone Number</label>
                      <div className="phone-input-wrapper">
                        <select 
                          value={countryCode} 
                          onChange={(e) => setCountryCode(e.target.value)}
                        >
                          <option value="+91">🇮🇳 +91</option>
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+44">🇬🇧 +44</option>
                          <option value="+61">🇦🇺 +61</option>
                          <option value="+65">🇸🇬 +65</option>
                          <option value="+971">🇦🇪 +971</option>
                        </select>
                        <input type="tel" placeholder="98765 43210" pattern="[0-9]{10}" maxLength="10" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} required />
                      </div>
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label>Email Address</label>
                  <div className="input-wrapper">
                    <input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>



                {role === 'EMPLOYEE' && (
                  <>
                    <div className="form-group">
                      <label>Department Role</label>
                      <div className="input-wrapper">
                        <select 
                          value={employeeRole} 
                          onChange={(e) => setEmployeeRole(e.target.value)}
                          required
                        >
                          <option value="HR">HR</option>
                          <option value="SALES">Sales</option>
                          <option value="MARKETING">Marketing</option>
                          <option value="DEVELOPMENT">Development</option>
                          <option value="DESIGN">Design</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Designation (Job Title)</label>
                      <div className="input-wrapper">
                        <input type="text" placeholder="e.g. Senior Recruiter, Frontend Dev" value={designation} onChange={(e) => setDesignation(e.target.value)} required />
                      </div>
                    </div>
                  </>
                )}

                {role === 'STUDENT' && (
                  <>
                    <div className="form-group">
                      <label>Parent/Guardian Phone</label>
                      <div className="phone-input-wrapper">
                        <select 
                          value={parentCountryCode} 
                          onChange={(e) => setParentCountryCode(e.target.value)}
                        >
                          <option value="+91">🇮🇳 +91</option>
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+44">🇬🇧 +44</option>
                          <option value="+61">🇦🇺 +61</option>
                          <option value="+65">🇸🇬 +65</option>
                          <option value="+971">🇦🇪 +971</option>
                        </select>
                        <input type="tel" placeholder="98765 43210" pattern="[0-9]{10}" maxLength="10" value={parentPhone} onChange={(e) => setParentPhone(e.target.value.replace(/\D/g, ''))} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Address</label>
                      <div className="input-wrapper">
                        <input type="text" placeholder="123 Main St, City" value={address} onChange={(e) => setAddress(e.target.value)} />
                      </div>
                    </div>
                  </>
                )}

                <div className="form-group">
                  <div className="label-row">
                    <label>Password</label>
                  </div>
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

                {error && <div style={{color: 'red', fontSize: '14px', marginBottom: '15px'}}>{error}</div>}

                <button type="submit" className="submit-btn">
                  Create Account
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft: '8px'}}>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>

                <div style={{textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#555F6B'}}>
                  Already have an account? 
                  <a href="#" onClick={(e) => { e.preventDefault(); navigate('/login'); }} style={{color: '#003F87', fontWeight: 'bold', textDecoration: 'none', marginLeft: '5px'}}>
                    Sign In
                  </a>
                </div>
              </form>
            )}

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
