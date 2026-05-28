'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const request = async (path, options = {}) => {
  const headers = { ...(options.headers || {}) };

  if (options.body && !headers['content-type']) {
    headers['content-type'] = 'application/json';
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message || 'Request failed');
  }

  return payload;
};

export default function LoginForm() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await request('/api/session/login', {
        method: 'POST',
        body: JSON.stringify({ phone, password }),
      });

      router.push('/dashboard');
      router.refresh();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Simple SVG icons
  const PhoneIcon = () => (
    <svg className="new-login-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
  );

  const LockIcon = () => (
    <svg className="new-login-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  );

  const EyeIcon = () => (
    <svg className="new-login-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );

  const EyeOffIcon = () => (
    <svg className="new-login-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  );

  const ArrowRightIcon = () => (
    <svg className="new-login-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
  );

  return (
    <main className="new-login-shell">
      <div className="new-login-sidebar">
        <div className="new-login-sidebar-bg"></div>
        <div className="new-login-sidebar-content">
          <div className="new-login-logo-container">
            <div className="new-login-logo">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#c00b4c"></path>
                <path d="M10 11h4v5h-4z" fill="white"></path>
                <path d="M8 11l4-4 4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </div>
          </div>
          <p className="new-login-tagline">Home Rental Admin Platform</p>
          <div className="new-login-dots">
            <div className="new-login-dot active"></div>
            <div className="new-login-dot"></div>
            <div className="new-login-dot"></div>
          </div>
        </div>
      </div>
      <div className="new-login-form-container">
        <div className="new-login-form-wrapper">
          <div className="new-login-mobile-logo">
            <div className="new-login-logo">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="none">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#c00b4c"></path>
                <path d="M10 11h4v5h-4z" fill="white"></path>
                <path d="M8 11l4-4 4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </div>
          </div>
          <h2 className="new-login-title">Sign in</h2>
          <p className="new-login-subtitle">Access your admin dashboard.</p>

          <form className="new-login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="new-login-error">
                <span className="new-login-error-dot"></span>
                {error}
              </div>
            )}

            <div className="new-login-fields">
              <div className="new-login-field">
                <label className="new-login-label">Phone Number</label>
                <div className="new-login-input-wrapper">
                  <span className="new-login-input-icon">
                    <PhoneIcon />
                  </span>
                  <input
                    type="text"
                    required
                    className="new-login-input"
                    placeholder="Enter your registered phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="new-login-field">
                <label className="new-login-label">Password</label>
                <div className="new-login-input-wrapper">
                  <span className="new-login-input-icon">
                    <LockIcon />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="new-login-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="new-login-toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
            </div>

            <button className="new-login-button" type="submit" disabled={submitting}>
              {submitting ? 'Authenticating...' : 'Sign in securely'}
              {!submitting && <ArrowRightIcon />}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
