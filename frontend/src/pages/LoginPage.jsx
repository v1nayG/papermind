import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './AuthPage.css'; // Import the new styles

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login(email, password);
      if (data.error) { setError(data.error); return; }
      login(data.user, { accessToken: data.accessToken, refreshToken: data.refreshToken });
      navigate('/');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* Background ambient glows */}
      <div className="auth-glow-top"></div>
      <div className="auth-glow-bottom"></div>

      <div className="auth-card-container">
        <div className="auth-logo-header">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 10.5403.5 6.0092 6.0092 0 0 0 4.7955 4.0487 5.9984 5.9984 0 0 0 .76 8.5283a6.0493 6.0493 0 0 0 1.2587 7.0754 5.984 5.984 0 0 0 .5134 4.91 6.048 6.048 0 0 0 6.512 2.9A6.0505 6.0505 0 0 0 13.76 24.5a6.0096 6.0096 0 0 0 5.744-3.548 5.9984 5.9984 0 0 0 4.0357-4.48 6.049 6.049 0 0 0-1.2578-7.0709zm-8.8351 13.1259a4.5209 4.5209 0 0 1-2.91-1.0773l.142-.082 4.8546-2.8027a.7547.7547 0 0 0 .3786-.6532v-6.8485l2.0526 1.185a.7327.7327 0 0 0 .3729.1025.753.753 0 0 0 .7536-.7536v-4.981a4.5367 4.5367 0 0 1 1.4886 4.3168 4.5684 4.5684 0 0 1-2.383 3.3235l-4.7503 2.7427a4.5422 4.5422 0 0 1-4.7397.4764zm-9.3361-4.3826a4.522 4.522 0 0 1-.5347-3.0645l.142.0838 4.8546 2.8027a.7535.7535 0 0 0 .7536 0l5.931-3.4244v2.37a.7547.7547 0 0 0 .3786.6532l4.3134 2.4903a4.537 4.537 0 0 1-4.5218.7369 4.5678 4.5678 0 0 1-3.6496-1.8488l-4.7503-2.7427a4.5407 4.5407 0 0 1-2.9168-3.0565zm-1.802-9.7562a4.5212 4.5212 0 0 1 2.3752-1.987l-.0008.1639v5.6054a.7545.7545 0 0 0 .3786.6532l5.931 3.4244-2.0526 1.185a.7547.7547 0 0 0-.3786.6532v4.981a4.5377 4.5377 0 0 1-3.0104-3.5799 4.5685 4.5685 0 0 1 1.2667-3.8724l4.7503-2.7427a4.5408 4.5408 0 0 1-9.2594-4.4842zm14.364-4.6644a4.5217 4.5217 0 0 1 2.91 1.0773l-.142.082-4.8546 2.8027a.7547.7547 0 0 0-.3786.6532v6.8485l-2.0526-1.185a.7327.7327 0 0 0-.3729-.1025.753.753 0 0 0-.7536.7536v4.981a4.5367 4.5367 0 0 1-1.4886-4.3168 4.5684 4.5684 0 0 1 2.383-3.3235l4.7503-2.7427a4.5422 4.5422 0 0 1 4.7397-.4764zm4.596 4.3826a4.522 4.522 0 0 1 .5347 3.0645l-.142-.0838-4.8546-2.8027a.7535.7535 0 0 0-.7536 0l-5.931 3.4244v-2.37a.7547.7547 0 0 0-.3786-.6532l-4.3134-2.4903a4.537 4.537 0 0 1 4.5218-.7369 4.5678 4.5678 0 0 1 3.6496 1.8488l4.7503 2.7427a4.5407 4.5407 0 0 1 2.9168 3.0565zm-4.129 5.3409v-2.37a.7547.7547 0 0 0-.3786-.6532l-5.931-3.4244 2.0526-1.185a.7547.7547 0 0 0 .3786-.6532v-4.981a4.5377 4.5377 0 0 1 3.0104 3.5799 4.5685 4.5685 0 0 1-1.2667 3.8724l-4.7503 2.7427a4.5408 4.5408 0 0 1-9.2594 4.4842l.0008-.1639v-5.6054a.7545.7545 0 0 0-.3786-.6532l-5.931-3.4244 2.0526-1.185a.7547.7547 0 0 0 .3786-.6532z"/>
          </svg>
          <h1>Welcome back</h1>
          <p>Sign in to continue your research</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="auth-input-group">
            <label htmlFor="email">Email address</label>
            <input 
              id="email"
              type="email" 
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required 
            />
          </div>

          <div className="auth-input-group">
            <label htmlFor="password">Password</label>
            <input 
              id="password"
              type="password" 
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required 
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? <div className="auth-spinner"></div> : 'Continue'}
          </button>
        </form>

        <div className="auth-footer-link">
          Don't have an account? <Link to="/register">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
