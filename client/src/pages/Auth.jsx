import React, { useState } from 'react';
import { Mail, Lock, User, ArrowLeft, Loader, CheckCircle2 } from 'lucide-react';
import { api } from '../utils/api';

const Auth = ({ initialMode, onAuthSuccess, onNavigateHome }) => {
  const [mode, setMode] = useState(initialMode || 'login'); // 'login' | 'register' | 'forgot'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Forgot password states
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let result;
      if (mode === 'login') {
        result = await api.auth.login(email, password);
      } else if (mode === 'register') {
        result = await api.auth.register(name, email, password);
      } else {
        // Forgot password simulation
        await new Promise(resolve => setTimeout(resolve, 1000));
        setResetSent(true);
        setLoading(false);
        return;
      }
      
      onAuthSuccess(result.user, result.token);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const mockName = 'Alex Mercer';
      const mockEmail = 'alex.mercer@student.edu';
      const mockGoogleId = 'g-108746203';
      const result = await api.auth.googleLogin(mockName, mockEmail, mockGoogleId);
      onAuthSuccess(result.user, result.token);
    } catch (err) {
      console.error(err);
      setError('Google Sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="gradient-bg-blob blob-indigo"></div>
      <div className="gradient-bg-blob blob-cyan"></div>

      <button onClick={onNavigateHome} className="back-btn glass-panel">
        <ArrowLeft size={16} />
        <span>Back to Welcome</span>
      </button>

      <div className="auth-card glass-panel">
        <div className="auth-header">
          <h2>
            {mode === 'login' && 'Sign In to StudyFlow'}
            {mode === 'register' && 'Create Your Account'}
            {mode === 'forgot' && 'Reset Password'}
          </h2>
          <p className="auth-subtitle">
            {mode === 'login' && 'Welcome back! Organize your schedule today.'}
            {mode === 'register' && 'Join StudyFlow to automate your planning.'}
            {mode === 'forgot' && "Enter your email to receive a password reset link."}
          </p>
        </div>

        {error && <div className="auth-error-alert">{error}</div>}

        {mode === 'forgot' && resetSent ? (
          <div className="reset-success-view">
            <CheckCircle2 size={44} className="success-icon" />
            <h3>Reset Email Sent!</h3>
            <p>We've sent recovery details to <strong>{email}</strong>. Please check your inbox.</p>
            <button onClick={() => { setMode('login'); setResetSent(false); }} className="btn btn-primary w-full">
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-with-icon">
                  <User size={16} className="input-icon" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">School Email</label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  required
                  placeholder="name@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div className="form-group">
                <div className="label-row">
                  <label className="form-label">Password</label>
                  {mode === 'login' && (
                    <button 
                      type="button" 
                      onClick={() => { setMode('forgot'); setError(null); }} 
                      className="forgot-link"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="input-with-icon">
                  <Lock size={16} className="input-icon" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
              {loading ? <Loader className="spinner" size={16} /> : null}
              <span>
                {mode === 'login' && 'Sign In'}
                {mode === 'register' && 'Create Account'}
                {mode === 'forgot' && 'Send Reset Link'}
              </span>
            </button>

            {mode !== 'forgot' && (
              <>
                <div className="divider-row">
                  <span className="divider-line"></span>
                  <span className="divider-text">or continue with</span>
                  <span className="divider-line"></span>
                </div>

                <button 
                  type="button" 
                  onClick={handleGoogleSignIn} 
                  className="btn btn-secondary google-btn"
                  disabled={loading}
                >
                  <svg className="google-svg" viewBox="0 0 24 24" width="16" height="16">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Google</span>
                </button>
              </>
            )}
          </form>
        )}

        <div className="auth-footer">
          {mode === 'login' && (
            <p>
              New to StudyFlow?{' '}
              <button onClick={() => { setMode('register'); setError(null); }} className="switch-mode-btn">
                Create an account
              </button>
            </p>
          )}
          {mode === 'register' && (
            <p>
              Already have an account?{' '}
              <button onClick={() => { setMode('login'); setError(null); }} className="switch-mode-btn">
                Sign in
              </button>
            </p>
          )}
          {mode === 'forgot' && !resetSent && (
            <button onClick={() => { setMode('login'); setError(null); }} className="switch-mode-btn">
              Back to Sign In
            </button>
          )}
        </div>
      </div>

      <style>{`
        .auth-container {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 1.5rem;
        }

        .back-btn {
          position: absolute;
          top: 30px;
          left: 30px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          color: var(--text-secondary);
          padding: 0.5rem 1rem;
          border-radius: 10px;
          cursor: pointer;
          font-size: 0.85rem;
          font-family: var(--font-display);
        }

        .back-btn:hover {
          color: var(--text-primary);
          border-color: var(--primary);
        }

        .auth-card {
          width: 100%;
          max-width: 440px;
          padding: 2.5rem;
          border-radius: 24px;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.35);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .auth-header h2 {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .auth-subtitle {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-top: 0.4rem;
        }

        .auth-error-alert {
          background-color: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: var(--danger);
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.8rem;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          color: var(--text-muted);
        }

        .input-with-icon .form-input {
          padding-left: 2.2rem;
        }

        .label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.4rem;
        }

        .forgot-link {
          background: transparent;
          border: none;
          color: var(--accent);
          font-size: 0.75rem;
          cursor: pointer;
          font-family: var(--font-sans);
        }
        .forgot-link:hover {
          text-decoration: underline;
        }

        .auth-submit-btn {
          width: 100%;
          padding: 0.75rem;
          font-size: 0.95rem;
          margin-top: 0.5rem;
        }

        .divider-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin: 0.5rem 0;
        }

        .divider-line {
          height: 1px;
          flex: 1;
          background: var(--card-border);
        }

        .divider-text {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 0.7rem;
          background: var(--input-bg);
          border: 1px solid var(--input-border);
        }

        .google-btn:hover {
          background: var(--bg-tertiary);
          border-color: var(--text-muted);
        }

        .google-svg {
          flex-shrink: 0;
        }

        .auth-footer {
          margin-top: 2rem;
          text-align: center;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .switch-mode-btn {
          background: transparent;
          border: none;
          color: var(--primary);
          font-weight: 600;
          cursor: pointer;
          font-family: var(--font-sans);
        }
        .switch-mode-btn:hover {
          text-decoration: underline;
        }

        .w-full {
          width: 100%;
        }

        .reset-success-view {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 1rem 0;
          gap: 1rem;
        }

        .success-icon {
          color: var(--success);
        }

        .reset-success-view p {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 600px) {
          .back-btn {
            position: relative;
            top: 0;
            left: 0;
            margin-bottom: 2rem;
          }
          .auth-container {
            flex-direction: column;
            justify-content: flex-start;
            padding-top: 3rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Auth;
